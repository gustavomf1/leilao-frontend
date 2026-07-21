import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RoleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar() faz GET em /api/roles', () => {
    service.listar().subscribe();
    http.expectOne('http://localhost:8080/api/roles').flush([]);
  });

  it('buscarPorId() faz GET em /api/roles/{id}', () => {
    service.buscarPorId(1).subscribe();
    http.expectOne('http://localhost:8080/api/roles/1').flush({});
  });

  it('criar() faz POST em /api/roles', () => {
    const role = { nome: 'ADMIN' } as any;
    service.criar(role).subscribe();
    const req = http.expectOne('http://localhost:8080/api/roles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(role);
    req.flush(role);
  });

  it('atualizar() faz PUT em /api/roles/{id}', () => {
    service.atualizar(1, { nome: 'ADMIN' } as any).subscribe();
    const req = http.expectOne('http://localhost:8080/api/roles/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deletar() faz DELETE em /api/roles/{id}', () => {
    service.deletar(1).subscribe();
    const req = http.expectOne('http://localhost:8080/api/roles/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('atribuirRoles() faz PUT em /api/roles/funcionario/{id} com o dto', () => {
    const dto = { roleIds: [1, 2] } as any;
    service.atribuirRoles(7, dto).subscribe();
    const req = http.expectOne('http://localhost:8080/api/roles/funcionario/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });
});
