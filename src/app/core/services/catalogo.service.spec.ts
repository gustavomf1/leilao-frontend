import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogoService } from './catalogo.service';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CatalogoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gerarCatalogo() faz GET em /api/catalogos/catalogo{tipo} com leilaoId e responseType blob', () => {
    service.gerarCatalogo(2, 5).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/catalogos/catalogo2');
    expect(req.request.params.get('leilaoId')).toBe('5');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });
});
