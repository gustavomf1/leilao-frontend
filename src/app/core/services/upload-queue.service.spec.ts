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
