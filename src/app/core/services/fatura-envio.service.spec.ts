import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FaturaEnvioService } from './fatura-envio.service';

describe('FaturaEnvioService', () => {
  let service: FaturaEnvioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FaturaEnvioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('enviarFaturaCompra() faz POST em /api/faturas/enviar/compra com loteId', () => {
    service.enviarFaturaCompra(11).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/faturas/enviar/compra');
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('loteId')).toBe('11');
    req.flush(null);
  });

  it('enviarFaturaVenda() faz POST em /api/faturas/enviar/venda com loteId', () => {
    service.enviarFaturaVenda(11).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/faturas/enviar/venda');
    expect(req.request.params.get('loteId')).toBe('11');
    req.flush(null);
  });

  it('enviarTodasFaturas() envia leilaoId e apenasNaoEnviados', () => {
    service.enviarTodasFaturas(1, true).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/faturas/enviar-todas');
    expect(req.request.params.get('leilaoId')).toBe('1');
    expect(req.request.params.get('apenasNaoEnviados')).toBe('true');
    req.flush({});
  });

  it('buscarLogs() faz GET em /api/faturas/log com leilaoId', () => {
    service.buscarLogs(1).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/faturas/log');
    expect(req.request.params.get('leilaoId')).toBe('1');
    req.flush({});
  });
});
