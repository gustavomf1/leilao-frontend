import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: string;
  dark?: boolean;
  accent?: boolean;
  trend?: number;
}

interface DiaSemana {
  d: string;
  vendas: number;
  ofertas: number;
}

interface ProximoLeilao {
  id: number;
  descricao: string;
  local: string;
  data: string;
  especie: string;
  tipo: string;
  lotes: number;
}

interface TopFazenda {
  nome: string;
  uf: string;
  lotes: number;
  total: number;
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
  ],
})
export class DashboardComponent {
  hoje = new Date();

  // KPIs: substituir por endpoint real quando disponível
  kpis: Kpi[] = [
    { label: 'Movimentação Bruta', value: 'R$ 1.284.600', sub: 'Últimos 30 dias', icon: 'cilDollar', dark: true, accent: true, trend: 12 },
    { label: 'Lotes Vendidos', value: '342', sub: 'de 376 cadastrados', icon: 'cilTags', trend: 8 },
    { label: 'Receita Comissão', value: 'R$ 31.480', sub: 'Taxa média 2,45%', icon: 'cilChartPie', trend: 4 },
    { label: 'Leilões Ativos', value: '3', sub: '1 ao vivo agora', icon: 'cilCalendar', trend: 0 },
  ];

  semanaData: DiaSemana[] = [
    { d: 'Seg', vendas: 38, ofertas: 64 },
    { d: 'Ter', vendas: 52, ofertas: 71 },
    { d: 'Qua', vendas: 22, ofertas: 48 },
    { d: 'Qui', vendas: 64, ofertas: 88 },
    { d: 'Sex', vendas: 76, ofertas: 92 },
    { d: 'Sáb', vendas: 12, ofertas: 24 },
    { d: 'Dom', vendas: 0,  ofertas: 0  },
  ];

  proximos: ProximoLeilao[] = [
    { id: 128, descricao: 'Leilão Outono 2026',       local: 'Pirassununga/SP', data: '2026-03-27', especie: 'Bovino', tipo: 'Presencial', lotes: 48 },
    { id: 129, descricao: 'Pregão Equinos Spring',    local: 'Barretos/SP',     data: '2026-04-02', especie: 'Equino', tipo: 'Online',     lotes: 22 },
    { id: 130, descricao: 'Leilão Especial Nelore PO', local: 'Uberaba/MG',     data: '2026-04-14', especie: 'Bovino', tipo: 'Híbrido',    lotes: 86 },
  ];

  topFazendas: TopFazenda[] = [
    { nome: 'Fazenda Boa Vista',       uf: 'SP', lotes: 24, total: 318400 },
    { nome: 'Pecuária São Pedro',      uf: 'MG', lotes: 19, total: 286200 },
    { nome: 'Fazenda Caraíba',         uf: 'GO', lotes: 17, total: 224800 },
    { nome: 'Estância Real',           uf: 'MS', lotes: 11, total: 168400 },
    { nome: 'Agropecuária Três Rios',  uf: 'MT', lotes: 9,  total: 142300 },
  ];

  get maxBar(): number {
    return Math.max(...this.semanaData.map((d) => d.ofertas));
  }

  barHeight(value: number): string {
    if (this.maxBar === 0) return '0%';
    return `${(value / this.maxBar) * 100}%`;
  }
}
