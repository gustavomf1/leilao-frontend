import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FuncionarioService } from './funcionario.service';

describe('FuncionarioService', () => {
  let service: FuncionarioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FuncionarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deletar() sobrescreve o endpoint padrão e chama /api/usuario/inativar/{id}', () => {
    service.deletar(4).subscribe();
    const req = http.expectOne('http://localhost:8080/api/usuario/inativar/4');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
