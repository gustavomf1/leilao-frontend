import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectorRef, DestroyRef, HostListener, inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { UploadQueueService, QueueItem } from '../../../core/services/upload-queue.service';
import { LoteFotoService, LoteFoto } from '../../../core/services/lote-foto.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lote-fotos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lote-fotos.component.html',
  styleUrl: './lote-fotos.component.css'
})
export class LoteFotosComponent implements OnInit, OnChanges {
  @Input() loteId: number | null = null;
  @Input() permitirEdicao = false;

  private queue = inject(UploadQueueService);
  private fotoService = inject(LoteFotoService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private alert = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  queueItems: QueueItem[] = [];
  confirmedFotos: LoteFoto[] = [];

  isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  uploadMenuAberto = false;

  toggleUploadMenu(event: MouseEvent) {
    event.stopPropagation();
    this.uploadMenuAberto = !this.uploadMenuAberto;
  }

  @HostListener('document:click')
  fecharUploadMenu() {
    this.uploadMenuAberto = false;
  }

  get totalFotos(): number {
    return this.queueItems.filter(i => i.status !== 'DONE').length + this.confirmedFotos.length;
  }

  get seletorDesabilitado(): boolean {
    return this.totalFotos >= 20;
  }

  pendingCadastro(item: QueueItem): boolean {
    return item.loteId === null;
  }

  ngOnInit() {
    this.queue.queue$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
      this.queueItems = items.filter(i =>
        this.loteId !== null ? i.loteId === this.loteId : i.loteId === null
      );
      this.cdr.markForCheck();
    });

    this.queue.completed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(foto => {
      if (foto.loteId !== this.loteId) return;
      if (this.confirmedFotos.some(f => f.id === foto.id)) return;
      this.confirmedFotos = [...this.confirmedFotos, foto].sort((a, b) => a.ordem - b.ordem);
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loteId']) {
      const curr: number | null = changes['loteId'].currentValue;
      const prev: number | null = changes['loteId'].previousValue ?? null;
      if (curr !== null && prev === null) {
        this.queue.assignLoteId(curr);
      }
      if (curr !== null) {
        this.carregarFotosConfirmadas();
      }
    }
  }

  carregarFotosConfirmadas() {
    if (this.loteId === null) return;
    this.fotoService.listar(this.loteId).subscribe({
      next: fotos => {
        this.confirmedFotos = fotos;
        this.cdr.markForCheck();
      },
      error: () => this.alert.error('Erro ao carregar fotos')
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const MAX_SIZE = 15 * 1024 * 1024;
    const selected = Array.from(input.files).slice(0, 20 - this.totalFotos);
    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        this.alert.error(`"${file.name}" excede o limite de 15 MB.`);
        continue;
      }
      this.queue.enqueue(this.loteId, file);
    }
    this.uploadMenuAberto = false;
    input.value = '';
  }

  retry(uuid: string) {
    this.queue.retryItem(uuid);
  }

  deletarConfirmada(foto: LoteFoto) {
    if (this.loteId === null) return;
    this.alert.confirm(`Excluir esta foto?`, () => {
      this.fotoService.deletar(this.loteId!, foto.id).subscribe({
        next: () => {
          this.confirmedFotos = this.confirmedFotos.filter(f => f.id !== foto.id);
          this.cdr.markForCheck();
        },
        error: () => this.alert.error('Erro ao excluir foto')
      });
    });
  }

  podeEditar(): boolean {
    return this.permitirEdicao || this.auth.isAdmin() || this.auth.hasPermission('LOTES', 'EDITAR');
  }
}
