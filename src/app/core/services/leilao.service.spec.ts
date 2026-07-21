import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LeilaoService } from './leilao.service';

describe('LeilaoService', () => {
  let service: LeilaoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LeilaoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('buscarResumo() faz GET em /api/leiloes/{id}/resumo', () => {
    service.buscarResumo(7).subscribe();
    http.expectOne('http://localhost:8080/api/leiloes/7/resumo').flush({});
  });

  it('buscarDetalhes() faz GET em /api/leiloes/{id}', () => {
    service.buscarDetalhes(7).subscribe();
    http.expectOne('http://localhost:8080/api/leiloes/7').flush({});
  });

  it('iniciarLeilao() faz PATCH em /api/leiloes/{id}/iniciar', () => {
    service.iniciarLeilao(7).subscribe();
    const req = http.expectOne('http://localhost:8080/api/leiloes/7/iniciar');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('encerrarLeilao() faz PATCH em /api/leiloes/{id}/encerrar', () => {
    service.encerrarLeilao(7).subscribe();
    const req = http.expectOne('http://localhost:8080/api/leiloes/7/encerrar');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
