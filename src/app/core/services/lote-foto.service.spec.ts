import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoteFotoService } from './lote-foto.service';

describe('LoteFotoService', () => {
  let service: LoteFotoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoteFotoService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoteFotoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPresignedUrl chama POST /api/lote/{id}/fotos/presigned-url', () => {
    service.getPresignedUrl(1, 'jpg').subscribe();
    const req = http.expectOne(r =>
      r.method === 'POST' && r.url.includes('/api/lote/1/fotos/presigned-url'));
    expect(req.request.body).toEqual({ ext: 'jpg' });
    req.flush({ key: 'k', presignedUrl: 'https://r2.example.com', expiresAt: '' });
  });

  it('confirmar chama POST /api/lote/{id}/fotos/confirmar', () => {
    service.confirmar(1, 'lotes/1/abc.jpg', 0).subscribe();
    const req = http.expectOne(r =>
      r.method === 'POST' && r.url.includes('/api/lote/1/fotos/confirmar'));
    expect(req.request.body).toEqual({ key: 'lotes/1/abc.jpg', ordem: 0 });
    req.flush({});
  });

  it('listar chama GET /api/lote/{id}/fotos', () => {
    service.listar(1).subscribe();
    const req = http.expectOne(r =>
      r.method === 'GET' && r.url.includes('/api/lote/1/fotos'));
    req.flush([]);
  });

  it('deletar chama DELETE /api/lote/{id}/fotos/{fotoId}', () => {
    service.deletar(1, 42).subscribe();
    const req = http.expectOne(r =>
      r.method === 'DELETE' && r.url.includes('/api/lote/1/fotos/42'));
    req.flush(null);
  });
});
