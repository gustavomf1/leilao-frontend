import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { LeilaoService } from '../../core/services/leilao.service';
import { LoteService } from '../../core/services/lote.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockDashboardService: any;
  let mockLeilaoService: any;
  let mockLoteService: any;

  const lotesMock = [
    { id: 1, leilaoId: 1, sexo: 'FEMEA', raca: 'Nelore', precoCompra: 1000, compradorId: 5, qntdAnimais: 2 },
    { id: 2, leilaoId: 1, sexo: 'MACHO', raca: 'Angus', precoCompra: 500, compradorNomeRascunho: 'Rascunho', qntdAnimais: 1 },
    { id: 3, leilaoId: 2, sexo: undefined, raca: undefined, precoCompra: 300, compradorId: 9, qntdAnimais: 1 },
    { id: 4, leilaoId: 1, sexo: 'FEMEA', raca: 'Nelore', naoVendidoNoLeilao: 'S', precoCompra: 200, compradorId: 3, qntdAnimais: 1 },
  ] as any;

  beforeEach(async () => {
    vi.useFakeTimers();
    mockDashboardService = {
      buscarLeiloesRecentes: vi.fn().mockReturnValue(of([{ id: 1, descricao: 'Recente' }] as any)),
      buscarVendasUltimosLeiloes: vi.fn().mockReturnValue(of([{ id: 1, totalVendido: 100 }] as any)),
    };
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of([{ id: 1, data: '2026-01-01' }, { id: 2, data: '2026-02-01' }] as any)) };
    mockLoteService = { listar: vi.fn().mockReturnValue(of(lotesMock)) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: LoteService, useValue: mockLoteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => vi.useRealTimers());

  function initAndFlush() {
    fixture.detectChanges();
    vi.runAllTimers();
  }

  it('ngOnInit carrega leilões (ordenados por data desc), últimos leilões e vendas dos últimos leilões', () => {
    initAndFlush();

    expect(mockLeilaoService.listar).toHaveBeenCalled();
    expect(component.leiloes.map((l: any) => l.id)).toEqual([2, 1]);
    expect(mockDashboardService.buscarLeiloesRecentes).toHaveBeenCalledWith(30);
    expect(component.ultimosLeiloes).toEqual([{ id: 1, descricao: 'Recente' }] as any);
    expect(mockDashboardService.buscarVendasUltimosLeiloes).toHaveBeenCalledWith(30);
  });

  it('agrega vendas por sexo e por raça a partir dos lotes vendidos (ignora não vendidos)', () => {
    initAndFlush();

    expect(component.vendasSexo?.totalVendido).toBe(2800);
    expect(component.vendasSexo?.totalLotes).toBe(3);
    expect(component.vendasSexo?.totalAnimais).toBe(4);

    const femeas = component.vendasPorSexo.find(i => i.sexo === 'Femeas');
    expect(femeas?.totalVendido).toBe(2000);

    const nelore = component.vendasPorRaca.find(i => i.raca === 'Nelore');
    expect(nelore?.totalVendido).toBe(2000);
  });

  it('selecionarLeilao() filtra os indicadores pelo leilão escolhido', () => {
    initAndFlush();

    component.selecionarLeilao('1');

    expect(component.leilaoSelecionadoId).toBe(1);
    expect(component.vendasSexo?.totalLotes).toBe(2);
  });

  it('selecionarLeilao() com valor vazio limpa a seleção', () => {
    initAndFlush();
    component.selecionarLeilao('1');
    component.selecionarLeilao('');
    expect(component.leilaoSelecionadoId).toBeUndefined();
  });

  it('carregarLeiloes() define erroLeiloes quando falha', () => {
    mockLeilaoService.listar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    initAndFlush();
    expect(component.erroLeiloes).toBe('Sem permissao para carregar leiloes.');
    expect(component.leiloes).toEqual([]);
  });

  it('carregarVendasDosLotes() define erros de vendas por sexo/raça quando o lote.service falha', () => {
    mockLoteService.listar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    initAndFlush();
    expect(component.erroVendasSexo).toBe('Sessao expirada ao carregar vendas por sexo.');
    expect(component.erroVendasRaca).toBe('Sessao expirada ao carregar vendas por raca.');
  });

  it('carregarUltimosLeiloes() define erroUltimosLeiloes quando falha', () => {
    mockDashboardService.buscarLeiloesRecentes.mockReturnValue(throwError(() => new Error('boom')));
    initAndFlush();
    expect(component.erroUltimosLeiloes).toBe('Nao foi possivel carregar ultimos leiloes.');
  });

  it('carregarVendasUltimosLeiloes() define erroVendasUltimosLeiloes quando falha', () => {
    mockDashboardService.buscarVendasUltimosLeiloes.mockReturnValue(throwError(() => new Error('boom')));
    initAndFlush();
    expect(component.erroVendasUltimosLeiloes).toBe('Nao foi possivel carregar vendas dos ultimos leiloes.');
  });

  it('formatarTipo() traduz os tipos conhecidos e devolve o original para os desconhecidos', () => {
    initAndFlush();
    expect(component.formatarTipo('PRESENCIAL')).toBe('Presencial');
    expect(component.formatarTipo('ONLINE')).toBe('Online');
    expect(component.formatarTipo('OUTRO')).toBe('OUTRO');
  });

  it('barWidthPercentual() garante um mínimo visível quando há venda', () => {
    initAndFlush();
    expect(component.barWidthPercentual({ percentualValor: 0, totalVendido: 100 } as any)).toBe('3%');
    expect(component.barWidthPercentual({ percentualValor: 0, totalVendido: 0 } as any)).toBe('0%');
    expect(component.barWidthPercentual({ percentualValor: 50, totalVendido: 100 } as any)).toBe('50%');
  });

  it('alturaVendaLeilao() calcula a altura relativa à maior venda da lista', () => {
    initAndFlush();
    component.vendasUltimosLeiloes = [{ totalVendido: 100 }, { totalVendido: 50 }] as any;
    expect(component.alturaVendaLeilao({ totalVendido: 100 } as any)).toBe('100%');
    expect(component.alturaVendaLeilao({ totalVendido: 50 } as any)).toBe('50%');
  });
});
