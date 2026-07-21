import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaxasService } from './taxas.service';

describe('TaxasService', () => {
  let service: TaxasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TaxasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obterAtual() faz GET em /api/taxa-padrao/atual', () => {
    service.obterAtual().subscribe();
    http.expectOne('http://localhost:8080/api/taxa-padrao/atual').flush({ taxa: 1 });
  });

  it('listar() sobrescrito envolve a taxa atual em uma lista', () => {
    let resultado: any;
    service.listar().subscribe(r => (resultado = r));
    http.expectOne('http://localhost:8080/api/taxa-padrao/atual').flush({ taxa: 2 });
    expect(resultado).toEqual([{ taxa: 2 }]);
  });

  it('listar() retorna array vazio quando não há taxa atual', () => {
    let resultado: any;
    service.listar().subscribe(r => (resultado = r));
    http.expectOne('http://localhost:8080/api/taxa-padrao/atual').flush(null);
    expect(resultado).toEqual([]);
  });

  it('salvar() sobrescrito envia apenas os campos de taxa esperados pelo backend', () => {
    service.salvar({ taxa: 1, comissaoVenda: 2, comissaoCompra: 3, gta: 4, idExtra: 99 } as any).subscribe();
    const req = http.expectOne('http://localhost:8080/api/taxa-padrao');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ taxa: 1, comissaoVenda: 2, comissaoCompra: 3, gta: 4 });
    req.flush({});
  });
});
