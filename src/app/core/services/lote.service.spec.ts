import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoteService } from './lote.service';

describe('LoteService', () => {
  let service: LoteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoteService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listarFotosPublico chama GET /api/publico/lote/{id}/fotos', () => {
    service.listarFotosPublico(7).subscribe();
    const req = http.expectOne(r =>
      r.method === 'GET' && r.url.includes('/api/publico/lote/7/fotos'));
    req.flush([]);
  });

  it('listarPorLeilaoPublico chama GET /api/publico/leilao/{id}/lotes', () => {
    service.listarPorLeilaoPublico(3).subscribe();
    http.expectOne(r => r.url.includes('/api/publico/leilao/3/lotes')).flush([]);
  });

  it('registrarPrecoPublico envia precoCompra e compradorNomeRascunho via PATCH', () => {
    service.registrarPrecoPublico(1, 500, 'João').subscribe();
    const req = http.expectOne(r => r.url.includes('/api/publico/lote/1/preco'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ precoCompra: 500, compradorNomeRascunho: 'João' });
    req.flush({});
  });

  it('avancarStatus chama PATCH /api/lote/{id}/status/avancar', () => {
    service.avancarStatus(1).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/lote/1/status/avancar'));
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('registrarPreco envia precoCompra e dados extras opcionais', () => {
    service.registrarPreco(1, 500, { compradorId: 9 }).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/lote/1/preco'));
    expect(req.request.body).toEqual({ precoCompra: 500, compradorId: 9 });
    req.flush({});
  });

  it('validarFinal envia os dados de validação via PATCH', () => {
    service.validarFinal(1, { compradorId: 9 }).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/lote/1/validar-final'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ compradorId: 9 });
    req.flush({});
  });

  it('gerarNotaLeilao faz GET com responseType blob', () => {
    service.gerarNotaLeilao(1).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/relatorios/nota-leilao/1'));
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });

  it('recolocarLance envia os dados via PATCH', () => {
    service.recolocarLance(1, { naoVendidoNoLeilao: 'N' }).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/lote/1/recolocar-lance'));
    expect(req.request.body).toEqual({ naoVendidoNoLeilao: 'N' });
    req.flush({});
  });

  it('transferirLote envia o leilaoId de destino via PATCH', () => {
    service.transferirLote(1, 7).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/lote/1/transferir'));
    expect(req.request.body).toEqual({ leilaoId: 7 });
    req.flush({});
  });

  it('definirPixVendedor envia o pixId via PATCH', () => {
    service.definirPixVendedor(1, 42).subscribe();
    const req = http.expectOne(r => r.url.includes('/api/lote/1/pix-vendedor'));
    expect(req.request.body).toEqual({ pixId: 42 });
    req.flush({});
  });
});
