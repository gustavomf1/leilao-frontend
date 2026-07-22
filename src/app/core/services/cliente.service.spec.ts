import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClienteService } from './cliente.service';

describe('ClienteService', () => {
  let service: ClienteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClienteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deletar() sobrescreve o endpoint padrão e chama /api/usuario/inativar/{id}', () => {
    service.deletar(9).subscribe();
    const req = http.expectOne('http://localhost:8080/api/usuario/inativar/9');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('buscarPorNome() faz GET em /api/usuario/cliente/buscar com o nome', () => {
    service.buscarPorNome('joao').subscribe();
    const req = http.expectOne('http://localhost:8080/api/usuario/cliente/buscar?nome=joao');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
