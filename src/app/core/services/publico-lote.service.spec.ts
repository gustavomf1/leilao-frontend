import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PublicoLoteService } from './publico-lote.service';

describe('PublicoLoteService', () => {
  let service: PublicoLoteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PublicoLoteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listarPorLeilao() faz GET em /api/publico/leilao/{id}/lotes', () => {
    service.listarPorLeilao(4).subscribe();
    http.expectOne('http://localhost:8080/api/publico/leilao/4/lotes').flush([]);
  });

  it('registrarPreco() faz PATCH em /api/publico/lote/{id}/preco com o precoCompra', () => {
    service.registrarPreco(9, 1500).subscribe();
    const req = http.expectOne('http://localhost:8080/api/publico/lote/9/preco');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ precoCompra: 1500 });
    req.flush({});
  });
});
