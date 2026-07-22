import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EspecieService } from './especie.service';

describe('EspecieService', () => {
  let service: EspecieService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EspecieService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar() faz GET em /api/especies', () => {
    service.listar().subscribe();
    http.expectOne('http://localhost:8080/api/especies').flush([]);
  });

  it('listarTodas() faz GET em /api/especies/todas', () => {
    service.listarTodas().subscribe();
    http.expectOne('http://localhost:8080/api/especies/todas').flush([]);
  });

  it('buscarPorId() faz GET em /api/especies/{id}', () => {
    service.buscarPorId(3).subscribe();
    http.expectOne('http://localhost:8080/api/especies/3').flush({});
  });

  it('salvar() faz POST em /api/especies', () => {
    service.salvar({ nome: 'Bovino' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/especies');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Bovino' });
    req.flush({});
  });

  it('atualizar() faz PUT em /api/especies/{id}', () => {
    service.atualizar(3, { nome: 'Bovino' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/especies/3');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('inativar() faz PATCH em /api/especies/{id}/inativar', () => {
    service.inativar(3).subscribe();
    const req = http.expectOne('http://localhost:8080/api/especies/3/inativar');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
