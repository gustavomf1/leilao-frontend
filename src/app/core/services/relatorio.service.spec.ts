import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RelatorioService } from './relatorio.service';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RelatorioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gerarFaturaVenda() envia leilaoId e vendedorId com responseType blob', () => {
    service.gerarFaturaVenda(1, 2).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/relatorios/fatura-venda');
    expect(req.request.params.get('leilaoId')).toBe('1');
    expect(req.request.params.get('vendedorId')).toBe('2');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });

  it('gerarFaturaCompra() envia leilaoId e compradorId', () => {
    service.gerarFaturaCompra(1, 3).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/relatorios/fatura-compra');
    expect(req.request.params.get('compradorId')).toBe('3');
    req.flush(new Blob());
  });

  it('gerarMapaLeilao() envia leilaoId', () => {
    service.gerarMapaLeilao(1).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/relatorios/mapa-leilao');
    expect(req.request.params.get('leilaoId')).toBe('1');
    req.flush(new Blob());
  });

  it('gerarFechamentoLeilao() envia leilaoId', () => {
    service.gerarFechamentoLeilao(1).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/relatorios/fechamento-leilao');
    req.flush(new Blob());
  });

  it('gerarLiberacaoRetorno() envia leilaoId e vendedorId', () => {
    service.gerarLiberacaoRetorno(1, 2).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/relatorios/liberacao-retorno');
    expect(req.request.params.get('vendedorId')).toBe('2');
    req.flush(new Blob());
  });

  it('gerarLiberacaoCompra() envia leilaoId e compradorId', () => {
    service.gerarLiberacaoCompra(1, 3).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/relatorios/liberacao-compra');
    expect(req.request.params.get('compradorId')).toBe('3');
    req.flush(new Blob());
  });

  it('getVendedoresDoLeilao() faz GET em /api/leiloes/{id}/vendedores', () => {
    service.getVendedoresDoLeilao(1).subscribe();
    http.expectOne('http://localhost:8080/api/leiloes/1/vendedores').flush([]);
  });

  it('getCompradoresDoLeilao() faz GET em /api/leiloes/{id}/compradores', () => {
    service.getCompradoresDoLeilao(1).subscribe();
    http.expectOne('http://localhost:8080/api/leiloes/1/compradores').flush([]);
  });
});
