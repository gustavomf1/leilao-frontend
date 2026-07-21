import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FazendaService } from './fazenda.service';

describe('FazendaService', () => {
  let service: FazendaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FazendaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('buscarPorNome() faz GET em /api/fazenda/buscar com o nome', () => {
    service.buscarPorNome('sao joao').subscribe();
    const req = http.expectOne('http://localhost:8080/api/fazenda/buscar?nome=sao joao');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
