import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { UploadQueueService } from './upload-queue.service';

describe('UploadQueueService', () => {
  let service: UploadQueueService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [UploadQueueService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UploadQueueService);
    // Await the service's own readiness promise (openDB + loadQueue) instead of
    // guessing with a fixed delay — this is a deterministic barrier, not a timeout.
    await (service as unknown as { ready: Promise<void> }).ready;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('queue$ emite array vazio inicialmente', async () => {
    const q = await firstValueFrom(service.queue$);
    expect(Array.isArray(q)).toBe(true);
  });

  it('enqueue funciona mesmo sem crypto.randomUUID (contexto HTTP não seguro, ex: IP público sem HTTPS)', async () => {
    const original = crypto.randomUUID;
    // @ts-expect-error simula ausência do método em contexto não seguro
    crypto.randomUUID = undefined;
    try {
      const arquivo = new File(['x'], 'sem-https.jpg', { type: 'image/jpeg' });
      await service.enqueue(null, arquivo);
      const fila = await firstValueFrom(service.queue$);
      const item = fila.find(i => i.fileName === 'sem-https.jpg');
      expect(item).toBeTruthy();
      expect(item!.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    } finally {
      crypto.randomUUID = original;
    }
  });

  it('clearOrphans remove da fila apenas os itens com loteId null', async () => {
    const arquivoOrfao = new File(['a'], 'orfao.jpg', { type: 'image/jpeg' });
    const arquivoComLote = new File(['b'], 'com-lote.jpg', { type: 'image/jpeg' });

    await service.enqueue(null, arquivoOrfao);
    await service.enqueue(999999, arquivoComLote);

    await service.clearOrphans();

    const fila = await firstValueFrom(service.queue$);
    expect(fila.some(i => i.fileName === 'orfao.jpg')).toBe(false);
    expect(fila.some(i => i.fileName === 'com-lote.jpg')).toBe(true);
  });
});
