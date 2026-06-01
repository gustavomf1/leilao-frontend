import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { openDB, IDBPDatabase } from 'idb';
import { LoteFotoService, LoteFoto } from './lote-foto.service';

export type QueueStatus = 'PENDING' | 'UPLOADING' | 'DONE' | 'FAILED';

export interface QueueItem {
  uuid: string;
  loteId: number | null;
  fileBlob: Blob;
  fileName: string;
  status: QueueStatus;
  r2Key?: string;
  presignedUrl?: string;
  errorMessage?: string;
  localUrl?: string;
}

const DB_NAME = 'leilao-upload-queue';
const STORE = 'queue';

@Injectable({ providedIn: 'root' })
export class UploadQueueService implements OnDestroy {
  private fotoService = inject(LoteFotoService);
  private db!: IDBPDatabase;
  private processing = new Set<string>();
  private onlineListener = () => this.reprocessPending();

  private queueSubject = new BehaviorSubject<QueueItem[]>([]);
  queue$ = this.queueSubject.asObservable();

  private completedSubject = new Subject<LoteFoto>();
  completed$ = this.completedSubject.asObservable();

  constructor() {
    this.init();
  }

  private async init() {
    this.db = await openDB(DB_NAME, 1, {
      upgrade(db) { db.createObjectStore(STORE, { keyPath: 'uuid' }); }
    });
    window.addEventListener('online', this.onlineListener);
    await this.loadQueue();
    if (navigator.onLine) this.reprocessPending();
  }

  private async loadQueue() {
    const all: QueueItem[] = await this.db.getAll(STORE);
    for (const item of all) {
      if (item.fileBlob) item.localUrl = URL.createObjectURL(item.fileBlob);
    }
    this.queueSubject.next(all);
  }

  async enqueue(loteId: number | null, file: File): Promise<void> {
    const item: QueueItem = {
      uuid: crypto.randomUUID(),
      loteId,
      fileBlob: file,
      fileName: file.name,
      status: 'PENDING',
      localUrl: URL.createObjectURL(file)
    };
    await this.db.put(STORE, item);
    this.emit([...this.queueSubject.value, item]);
    if (loteId !== null && navigator.onLine) this.process(item);
  }

  async assignLoteId(loteId: number): Promise<void> {
    const toAssign = this.queueSubject.value.filter(i => i.loteId === null);
    for (const item of toAssign) {
      await this.updateItem(item.uuid, { loteId });
    }
    const assigned = this.queueSubject.value.filter(i => i.loteId === loteId && i.status === 'PENDING');
    if (navigator.onLine) {
      for (const item of assigned) this.process(item);
    }
  }

  async retryItem(uuid: string): Promise<void> {
    const item = this.queueSubject.value.find(i => i.uuid === uuid);
    if (!item) return;
    this.processing.delete(uuid);
    await this.updateItem(uuid, { status: 'PENDING', errorMessage: undefined, presignedUrl: undefined });
    if (navigator.onLine) this.process({ ...item, status: 'PENDING', presignedUrl: undefined });
  }

  private async reprocessPending(): Promise<void> {
    const pending = this.queueSubject.value.filter(
      i => (i.status === 'PENDING' || i.status === 'FAILED') && !this.processing.has(i.uuid)
    );
    for (const item of pending) this.process(item);
  }

  private async process(item: QueueItem): Promise<void> {
    if (item.loteId === null || this.processing.has(item.uuid)) return;
    this.processing.add(item.uuid);

    const loteId = item.loteId;
    const ext = item.fileName.split('.').pop() ?? 'jpg';
    const delays = [0, 5000, 15000, 30000];

    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) await new Promise(r => setTimeout(r, delays[attempt]));
      try {
        await this.updateItem(item.uuid, { status: 'UPLOADING' });

        let key = item.r2Key;
        let presignedUrl = item.presignedUrl;

        if (!key || !presignedUrl) {
          const res = await firstValueFrom(this.fotoService.getPresignedUrl(loteId, ext));
          key = res.key;
          presignedUrl = res.presignedUrl;
          await this.updateItem(item.uuid, { r2Key: key, presignedUrl });
        }

        await this.putToR2(presignedUrl!, item.fileBlob);
        const ordem = this.queueSubject.value.filter(i => i.status === 'DONE' && i.loteId === loteId).length;
        const foto = await firstValueFrom(this.fotoService.confirmar(loteId, key!, ordem));
        await this.db.delete(STORE, item.uuid);
        this.emit(this.queueSubject.value.filter(i => i.uuid !== item.uuid));
        this.completedSubject.next(foto);
        this.processing.delete(item.uuid);
        return;
      } catch (err: any) {
        if (attempt === delays.length - 1) {
          await this.updateItem(item.uuid, { status: 'FAILED', errorMessage: err?.message ?? 'Erro desconhecido' });
          this.processing.delete(item.uuid);
          return;
        }
      }
    }
  }

  private putToR2(url: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', blob.type || 'image/jpeg');
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`HTTP ${xhr.status}`));
      xhr.onerror = () => reject(new Error('Erro de rede'));
      xhr.send(blob);
    });
  }

  private async updateItem(uuid: string, patch: Partial<QueueItem>): Promise<void> {
    const current = this.queueSubject.value.find(i => i.uuid === uuid);
    if (!current) return;
    const updated = { ...current, ...patch };
    await this.db.put(STORE, updated);
    this.emit(this.queueSubject.value.map(i => i.uuid === uuid ? updated : i));
  }

  private emit(items: QueueItem[]) {
    this.queueSubject.next(items);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onlineListener);
    this.db?.close();
  }
}
