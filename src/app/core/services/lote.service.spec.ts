import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoteService } from './lote.service';

describe('LoteService', () => {
  let service: LoteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoteService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listarFotosPublico chama GET /api/publico/lote/{id}/fotos', () => {
    service.listarFotosPublico(7).subscribe();
    const req = http.expectOne(r =>
      r.method === 'GET' && r.url.includes('/api/publico/lote/7/fotos'));
    req.flush([]);
  });
});
