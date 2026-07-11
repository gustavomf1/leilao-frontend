import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';
import {
  DashboardLeilaoVenda,
  DashboardLeilaoRecente,
  DashboardService,
  DashboardVendasRaca,
  DashboardVendasRacaItem,
  DashboardVendasSexo,
  DashboardVendasSexoItem,
} from '../../core/services/dashboard.service';
import { Leilao, Lote } from '../../core/models/entities.model';
import { LeilaoService } from '../../core/services/leilao.service';
import { LoteService } from '../../core/services/lote.service';

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: string;
  dark?: boolean;
  accent?: boolean;
  trend?: number;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    RowComponent,
    ColComponent,
    TableDirective,
    IconDirective,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private leilaoService = inject(LeilaoService);
  private loteService = inject(LoteService);
  private lotesDashboard: Lote[] | null = null;
  private carregamentoIndicadoresId = 0;

  hoje = new Date();
  leiloes: Leilao[] = [];
  leilaoSelecionadoId?: number;
  vendasSexo?: DashboardVendasSexo;
  vendasRaca?: DashboardVendasRaca;
  vendasPorSexo: DashboardVendasSexoItem[] = [];
  vendasPorRaca: DashboardVendasRacaItem[] = [];
  vendasUltimosLeiloes: DashboardLeilaoVenda[] = [];
  carregandoVendasSexo = false;
  carregandoVendasRaca = false;
  carregandoUltimosLeiloes = false;
  carregandoLeiloes = false;
  carregandoVendasUltimosLeiloes = false;
  erroVendasSexo?: string;
  erroVendasRaca?: string;
  erroUltimosLeiloes?: string;
  erroLeiloes?: string;
  erroVendasUltimosLeiloes?: string;

  kpis: Kpi[] = [
    { label: 'Movimentacao Bruta', value: 'R$ 0', sub: 'Lotes vendidos', icon: 'cilDollar', dark: true, accent: true },
    { label: 'Lotes Vendidos', value: '0', sub: 'Com preco e comprador', icon: 'cilTags' },
    { label: 'Animais Vendidos', value: '0', sub: 'Cabecas negociadas', icon: 'cilAnimal' },
    { label: 'Preco Medio', value: 'R$ 0', sub: 'Por animal vendido', icon: 'cilChartPie' },
  ];

  ultimosLeiloes: DashboardLeilaoRecente[] = [];

  ngOnInit(): void {
    window.setTimeout(() => {
      this.carregarLeiloes();
      this.carregarIndicadores(this.leilaoSelecionadoId);
      this.carregarUltimosLeiloes();
      this.carregarVendasUltimosLeiloes();
    });
  }

  selecionarLeilao(value: string): void {
    const leilaoId = value ? Number(value) : undefined;
    this.leilaoSelecionadoId = leilaoId;
    this.carregarIndicadores(leilaoId);
  }

  barWidthPercentual(item: DashboardVendasSexoItem | DashboardVendasRacaItem): string {
    return `${Math.max(item.percentualValor, item.totalVendido > 0 ? 3 : 0)}%`;
  }

  alturaVendaLeilao(item: DashboardLeilaoVenda): string {
    const maiorVenda = Math.max(...this.vendasUltimosLeiloes.map(leilao => leilao.totalVendido), 0);
    const percentual = maiorVenda > 0 ? (item.totalVendido / maiorVenda) * 100 : 0;
    return `${Math.max(percentual, item.totalVendido > 0 ? 4 : 1)}%`;
  }

  formatarTipo(tipo: string): string {
    const labels: Record<string, string> = {
      PRESENCIAL: 'Presencial',
      ONLINE: 'Online',
      HIBRIDO: 'Hibrido',
    };
    return labels[tipo] ?? tipo ?? '-';
  }

  private carregarIndicadores(leilaoIdSelecionado = this.leilaoSelecionadoId): void {
    this.resetarIndicadores();
    this.carregarVendasDosLotes(leilaoIdSelecionado);
  }

  private carregarLeiloes(): void {
    this.carregandoLeiloes = true;
    this.erroLeiloes = undefined;

    this.leilaoService.listar().subscribe({
      next: (dados) => {
        this.leiloes = [...dados].sort((a, b) => String(b.data).localeCompare(String(a.data)));
        this.carregandoLeiloes = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar leiloes do filtro', err.status, err.error ?? err.message);
        this.erroLeiloes = this.mensagemErroDashboard('leiloes', err);
        this.leiloes = [];
        this.carregandoLeiloes = false;
      },
    });
  }

  private carregarVendasDosLotes(leilaoIdSelecionado?: number): void {
    const carregamentoId = ++this.carregamentoIndicadoresId;
    this.carregandoVendasSexo = true;
    this.carregandoVendasRaca = true;
    this.erroVendasSexo = undefined;
    this.erroVendasRaca = undefined;

    if (this.lotesDashboard) {
      this.aplicarIndicadoresDosLotes(this.lotesDashboard, carregamentoId, leilaoIdSelecionado);
      return;
    }

    this.loteService.listar().subscribe({
      next: (lotes) => {
        this.lotesDashboard = lotes;
        this.aplicarIndicadoresDosLotes(lotes, carregamentoId, leilaoIdSelecionado);
      },
      error: (err: HttpErrorResponse) => {
        if (carregamentoId !== this.carregamentoIndicadoresId) {
          return;
        }
        console.error('Erro ao carregar lotes para dashboard', err.status, err.error ?? err.message);
        this.erroVendasSexo = this.mensagemErroDashboard('vendas por sexo', err);
        this.erroVendasRaca = this.mensagemErroDashboard('vendas por raca', err);
        this.vendasPorSexo = [];
        this.vendasPorRaca = [];
        this.carregandoVendasSexo = false;
        this.carregandoVendasRaca = false;
      },
    });
  }

  private aplicarIndicadoresDosLotes(lotes: Lote[], carregamentoId: number, leilaoIdSelecionado?: number): void {
    if (carregamentoId !== this.carregamentoIndicadoresId) {
      return;
    }

    const lotesVendidos = lotes
      .filter(lote => this.pertenceAoLeilaoSelecionado(lote, leilaoIdSelecionado))
      .filter(lote => this.isLoteVendido(lote));

    this.vendasSexo = this.montarVendasPorSexo(lotesVendidos);
    this.vendasRaca = this.montarVendasPorRaca(lotesVendidos);
    this.vendasPorSexo = [...this.vendasSexo.itens];
    this.vendasPorRaca = [...this.vendasRaca.itens];
    this.atualizarKpis(this.vendasSexo);
    this.carregandoVendasSexo = false;
    this.carregandoVendasRaca = false;
  }

  private carregarUltimosLeiloes(): void {
    this.carregandoUltimosLeiloes = true;
    this.erroUltimosLeiloes = undefined;

    this.dashboardService.buscarLeiloesRecentes(30).subscribe({
      next: (dados) => {
        this.ultimosLeiloes = dados;
        this.carregandoUltimosLeiloes = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar ultimos leiloes', err.status, err.error ?? err.message);
        this.erroUltimosLeiloes = this.mensagemErroDashboard('ultimos leiloes', err);
        this.ultimosLeiloes = [];
        this.carregandoUltimosLeiloes = false;
      },
    });
  }

  private carregarVendasUltimosLeiloes(): void {
    this.carregandoVendasUltimosLeiloes = true;
    this.erroVendasUltimosLeiloes = undefined;

    this.dashboardService.buscarVendasUltimosLeiloes(30).subscribe({
      next: (dados) => {
        this.vendasUltimosLeiloes = dados;
        this.carregandoVendasUltimosLeiloes = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar vendas dos ultimos leiloes', err.status, err.error ?? err.message);
        this.erroVendasUltimosLeiloes = this.mensagemErroDashboard('vendas dos ultimos leiloes', err);
        this.vendasUltimosLeiloes = [];
        this.carregandoVendasUltimosLeiloes = false;
      },
    });
  }

  private mensagemErroDashboard(recurso: string, err: HttpErrorResponse | Error): string {
    if (err.name === 'TimeoutError') {
      return `Tempo esgotado ao carregar ${recurso}.`;
    }
    const status = err instanceof HttpErrorResponse ? err.status : 0;
    if (status === 403) {
      return `Sem permissao para carregar ${recurso}.`;
    }
    if (status === 401) {
      return `Sessao expirada ao carregar ${recurso}.`;
    }
    return `Nao foi possivel carregar ${recurso}.`;
  }

  private resetarIndicadores(): void {
    this.vendasSexo = undefined;
    this.vendasRaca = undefined;
    this.vendasPorSexo = [];
    this.vendasPorRaca = [];
    this.erroVendasSexo = undefined;
    this.erroVendasRaca = undefined;
    this.kpis = [
      { label: 'Movimentacao Bruta', value: 'R$ 0', sub: 'Lotes vendidos', icon: 'cilDollar', dark: true, accent: true },
      { label: 'Lotes Vendidos', value: '0', sub: 'Com preco e comprador', icon: 'cilTags' },
      { label: 'Animais Vendidos', value: '0', sub: 'Cabecas negociadas', icon: 'cilAnimal' },
      { label: 'Preco Medio', value: 'R$ 0', sub: 'Por animal vendido', icon: 'cilChartPie' },
    ];
  }

  private atualizarKpis(dados: DashboardVendasSexo): void {
    const precoMedio = dados.totalAnimais > 0 ? dados.totalVendido / dados.totalAnimais : 0;
    this.kpis = [
      { label: 'Movimentacao Bruta', value: this.formatarMoeda(dados.totalVendido), sub: 'Lotes vendidos', icon: 'cilDollar', dark: true, accent: true },
      { label: 'Lotes Vendidos', value: String(dados.totalLotes), sub: 'Com preco e comprador', icon: 'cilTags' },
      { label: 'Animais Vendidos', value: String(dados.totalAnimais), sub: 'Cabecas negociadas', icon: 'cilAnimal' },
      { label: 'Preco Medio', value: this.formatarMoeda(precoMedio), sub: 'Por animal vendido', icon: 'cilChartPie' },
    ];
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(valor ?? 0);
  }

  private pertenceAoLeilaoSelecionado(lote: Lote, leilaoIdSelecionado?: number): boolean {
    return leilaoIdSelecionado == null || Number(lote.leilaoId) === Number(leilaoIdSelecionado);
  }

  private isLoteVendido(lote: Lote): boolean {
    return lote.precoCompra != null
      && this.temComprador(lote)
      && lote.naoVendidoNoLeilao !== 'S';
  }

  private temComprador(lote: Lote): boolean {
    return lote.compradorId != null
      || this.temTexto(lote.compradorNome)
      || this.temTexto(lote.compradorNomeRascunho);
  }

  private montarVendasPorSexo(lotes: Lote[]): DashboardVendasSexo {
    const acumuladores = new Map<string, { lotes: number; animais: number; total: number }>([
      ['Femeas', { lotes: 0, animais: 0, total: 0 }],
      ['Machos', { lotes: 0, animais: 0, total: 0 }],
      ['Nao informado', { lotes: 0, animais: 0, total: 0 }],
    ]);

    for (const lote of lotes) {
      const sexo = this.normalizarSexo(lote.sexo);
      this.adicionarAcumulador(acumuladores, sexo, lote);
    }

    return this.toResumoVendas(acumuladores, 'sexo') as DashboardVendasSexo;
  }

  private montarVendasPorRaca(lotes: Lote[]): DashboardVendasRaca {
    const acumuladores = new Map<string, { lotes: number; animais: number; total: number }>();

    for (const lote of lotes) {
      const raca = this.temTexto(lote.raca) ? lote.raca.trim() : 'Nao informada';
      this.adicionarAcumulador(acumuladores, raca, lote);
    }

    return this.toResumoVendas(acumuladores, 'raca') as DashboardVendasRaca;
  }

  private adicionarAcumulador(
    acumuladores: Map<string, { lotes: number; animais: number; total: number }>,
    chave: string,
    lote: Lote,
  ): void {
    const acumulador = acumuladores.get(chave) ?? { lotes: 0, animais: 0, total: 0 };
    const animais = lote.qntdAnimais ?? 0;
    acumulador.lotes += 1;
    acumulador.animais += animais;
    acumulador.total += (lote.precoCompra ?? 0) * animais;
    acumuladores.set(chave, acumulador);
  }

  private toResumoVendas(
    acumuladores: Map<string, { lotes: number; animais: number; total: number }>,
    campo: 'sexo' | 'raca',
  ): DashboardVendasSexo | DashboardVendasRaca {
    const totalVendido = [...acumuladores.values()].reduce((total, item) => total + item.total, 0);
    const totalLotes = [...acumuladores.values()].reduce((total, item) => total + item.lotes, 0);
    const totalAnimais = [...acumuladores.values()].reduce((total, item) => total + item.animais, 0);
    const itens = [...acumuladores.entries()]
      .filter(([, item]) => item.lotes > 0)
      .sort((a, b) => campo === 'raca' ? b[1].total - a[1].total : 0)
      .map(([chave, item]) => ({
        [campo]: chave,
        lotesVendidos: item.lotes,
        animaisVendidos: item.animais,
        totalVendido: item.total,
        precoMedioPorAnimal: item.animais > 0 ? item.total / item.animais : 0,
        precoMedioPorLote: item.lotes > 0 ? item.total / item.lotes : 0,
        percentualValor: totalVendido > 0 ? (item.total / totalVendido) * 100 : 0,
      }));

    return {
      totalVendido,
      totalLotes,
      totalAnimais,
      itens,
    } as unknown as DashboardVendasSexo | DashboardVendasRaca;
  }

  private normalizarSexo(sexo?: string): string {
    const valor = this.normalizarSemAcento(sexo);

    if (!valor) {
      return 'Nao informado';
    }
    if (valor.startsWith('F') || valor.includes('FEMEA')) {
      return 'Femeas';
    }
    if (valor.startsWith('M') || valor.includes('MACHO')) {
      return 'Machos';
    }
    return 'Nao informado';
  }

  private normalizarSemAcento(valor?: string): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private temTexto(valor?: string): boolean {
    return !!valor?.trim();
  }
}
