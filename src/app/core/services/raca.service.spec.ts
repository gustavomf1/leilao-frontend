import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RacaService } from './raca.service';

describe('RacaService', () => {
  let service: RacaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RacaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listarTodas() faz GET em /api/racas/todas', () => {
    service.listarTodas().subscribe();
    http.expectOne('http://localhost:8080/api/racas/todas').flush([]);
  });

  it('listarPorEspecie() faz GET em /api/racas/especie/{id}', () => {
    service.listarPorEspecie(2).subscribe();
    http.expectOne('http://localhost:8080/api/racas/especie/2').flush([]);
  });

  it('buscarPorId() faz GET em /api/racas/{id}', () => {
    service.buscarPorId(1).subscribe();
    http.expectOne('http://localhost:8080/api/racas/1').flush({});
  });

  it('salvar() faz POST em /api/racas', () => {
    service.salvar({ nome: 'Nelore', especieId: 2 }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/racas');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('atualizar() faz PUT em /api/racas/{id}', () => {
    service.atualizar(1, { nome: 'Nelore', especieId: 2 }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/racas/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('toggleInativo() faz PATCH em /api/racas/{id}/inativar', () => {
    service.toggleInativo(1).subscribe();
    const req = http.expectOne('http://localhost:8080/api/racas/1/inativar');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
