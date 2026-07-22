import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';

describe('RecuperacaoSenhaService', () => {
  let service: RecuperacaoSenhaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RecuperacaoSenhaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('validar() faz GET em /api/senha/validar com o token como query param e responseType text', () => {
    service.validar('tok123').subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/senha/validar');
    expect(req.request.params.get('token')).toBe('tok123');
    expect(req.request.responseType).toBe('text');
    req.flush('ok');
  });

  it('solicitar() faz POST em /api/senha/solicitar com o email', () => {
    service.solicitar('a@a.com').subscribe();
    const req = http.expectOne('http://localhost:8080/api/senha/solicitar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@a.com' });
    req.flush({});
  });

  it('redefinir() faz POST em /api/senha/redefinir com token e novaSenha', () => {
    service.redefinir('tok123', 'nova123').subscribe();
    const req = http.expectOne('http://localhost:8080/api/senha/redefinir');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'tok123', novaSenha: 'nova123' });
    req.flush({});
  });
});
