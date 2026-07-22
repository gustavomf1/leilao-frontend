import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('buscarVendasPorSexo() omite o param leilaoId quando não informado', () => {
    service.buscarVendasPorSexo().subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/dashboard/vendas-sexo');
    expect(req.request.params.has('leilaoId')).toBe(false);
    req.flush({});
  });

  it('buscarVendasPorSexo() inclui leilaoId quando informado', () => {
    service.buscarVendasPorSexo(5).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/dashboard/vendas-sexo');
    expect(req.request.params.get('leilaoId')).toBe('5');
    req.flush({});
  });

  it('buscarVendasPorRaca() aceita leilaoId opcional', () => {
    service.buscarVendasPorRaca(5).subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/dashboard/vendas-raca');
    expect(req.request.params.get('leilaoId')).toBe('5');
    req.flush({});
  });

  it('buscarLeiloesRecentes() usa 30 dias como padrão', () => {
    service.buscarLeiloesRecentes().subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/dashboard/leiloes-recentes');
    expect(req.request.params.get('dias')).toBe('30');
    req.flush([]);
  });

  it('buscarVendasUltimosLeiloes() usa 30 como limite padrão', () => {
    service.buscarVendasUltimosLeiloes().subscribe();
    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/dashboard/vendas-ultimos-leiloes');
    expect(req.request.params.get('limite')).toBe('30');
    req.flush([]);
  });
});
