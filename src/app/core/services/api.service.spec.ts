import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

interface Fake { id: number; nome: string }

@Injectable()
class FakeApiService extends ApiService<Fake> {
  protected endpoint = 'fake';
}

describe('ApiService', () => {
  let service: FakeApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FakeApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FakeApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar() faz GET em /api/{endpoint}', () => {
    service.listar().subscribe();
    const req = http.expectOne('http://localhost:8080/api/fake');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listarPaginado() envia page e size como query params', () => {
    service.listarPaginado(2, 10).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/fake/paginado');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.has('busca')).toBe(false);
    req.flush({ content: [], totalElements: 0 });
  });

  it('listarPaginado() inclui busca quando informado', () => {
    service.listarPaginado(0, 20, 'joao').subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/fake/paginado');
    expect(req.request.params.get('busca')).toBe('joao');
    req.flush({ content: [], totalElements: 0 });
  });

  it('buscarPorId() faz GET em /api/{endpoint}/{id}', () => {
    service.buscarPorId(5).subscribe();
    const req = http.expectOne('http://localhost:8080/api/fake/5');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 5, nome: 'x' });
  });

  it('salvar() faz POST com o corpo da entidade', () => {
    const entity = { id: 0, nome: 'novo' } as Fake;
    service.salvar(entity).subscribe();
    const req = http.expectOne('http://localhost:8080/api/fake');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(entity);
    req.flush(entity);
  });

  it('atualizar() faz PUT em /api/{endpoint}/{id}', () => {
    const entity = { id: 5, nome: 'editado' } as Fake;
    service.atualizar(5, entity).subscribe();
    const req = http.expectOne('http://localhost:8080/api/fake/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(entity);
    req.flush(entity);
  });

  it('deletar() faz DELETE em /api/{endpoint}/{id}', () => {
    service.deletar(5).subscribe();
    const req = http.expectOne('http://localhost:8080/api/fake/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
