import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PixService } from './pix.service';

describe('PixService', () => {
  let service: PixService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PixService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listarPorUsuario() faz GET em /api/pix/usuario/{id}', () => {
    service.listarPorUsuario(8).subscribe();
    http.expectOne('http://localhost:8080/api/pix/usuario/8').flush([]);
  });

  it('cadastrar() faz POST em /api/pix', () => {
    const pix = { chave: 'abc' } as any;
    service.cadastrar(pix).subscribe();
    const req = http.expectOne('http://localhost:8080/api/pix');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(pix);
    req.flush(pix);
  });

  it('deletar() faz DELETE em /api/pix/{id}', () => {
    service.deletar(3).subscribe();
    const req = http.expectOne('http://localhost:8080/api/pix/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
