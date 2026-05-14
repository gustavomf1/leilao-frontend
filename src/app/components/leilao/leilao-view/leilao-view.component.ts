import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  CardModule, BadgeComponent, ButtonDirective,
  GridModule, TableModule, TableDirective
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faMapMarkerAlt, faCalendarAlt, faGavel,
  faHandshake, faDollarSign, faPaw, faInfoCircle,
  faCheckCircle, faClock, faPencil
} from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { Lote } from '../../../core/models/entities.model';

interface LeilaoResumo {
  id: number;
  descricao: string;
  local: string;
  cidade: string;
  uf: string;
  data: string;
  condicao?: { descricao?: string };
  especie?: { nome?: string };
  taxaPadrao?: { taxa?: number; comissaoVenda?: number; comissaoCompra?: number; gta?: number };
  condicaoDescricao?: string;
  taxa?: number;
  comissaoVenda?: number;
  comissaoCompra?: number;
  gta?: number;
  especieNome?: string;
  tipoLeilao?: string;
  taxaPor?: string;
  totalLotes: number;
  lotesVendidos: number;
  lotesRestantes: number;
  totalAnimais: number;
  animaisVendidos: number;
  movimentacaoBruta: number;
  receitaComissao: number;
  ticketMedio: number;
  lotes: Lote[];
}

@Component({
  selector: 'app-leilao-view',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    CardModule, BadgeComponent, ButtonDirective,
    GridModule, TableModule, TableDirective,
    FontAwesomeModule
  ],
  templateUrl: './leilao-view.component.html',
  styleUrl: './leilao-view.component.scss'
})
export class LeilaoViewComponent implements OnInit {
  private service = inject(LeilaoService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  faArrowLeft = faArrowLeft;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendarAlt = faCalendarAlt;
  faGavel = faGavel;
  faHandshake = faHandshake;
  faPercent = faDollarSign;
  faPaw = faPaw;
  faInfoCircle = faInfoCircle;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faPencil = faPencil;

  resumo?: LeilaoResumo;
  loading$ = new BehaviorSubject<boolean>(true);

  get lotesVendidos(): Lote[] {
    return this.resumo?.lotes.filter(l => l.compradorId != null) ?? [];
  }

  get lotesRestantes(): Lote[] {
    return this.resumo?.lotes.filter(l => l.compradorId == null) ?? [];
  }

  get percentualVendido(): number {
    if (!this.resumo || this.resumo.totalLotes === 0) return 0;
    return Math.round((this.resumo.lotesVendidos / this.resumo.totalLotes) * 100);
  }

  get pesoTotal(): number {
    return this.resumo?.lotes.reduce((sum, l) => sum + (l.peso || 0), 0) ?? 0;
  }

  get especieNome(): string {
    return this.resumo?.especieNome || this.resumo?.especie?.nome || '—';
  }

  get condicaoDescricao(): string {
    return this.resumo?.condicaoDescricao || this.resumo?.condicao?.descricao || '—';
  }

  get taxaPorLabel(): string {
    if (!this.resumo?.taxaPor) return '—';
    return this.resumo.taxaPor === 'ANIMAL' ? 'Animal' : 'Lote';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading$.next(false);
      return;
    }
    this.service.buscarResumo(+id).subscribe({
      next: (data: LeilaoResumo) => {
        this.resumo = this.normalizarResumo(data);
        this.loading$.next(false);
      },
      error: (err: any) => {
        this.alert.error(err.error?.mensagem || 'Erro ao carregar resumo do leilão');
        this.loading$.next(false);
      }
    });
  }

  tipoLeilaoLabel(tipo?: string): string {
    const labels: Record<string, string> = {
      PRESENCIAL: 'Presencial', ONLINE: 'Online', HIBRIDO: 'Híbrido',
      ELITE: 'Elite', CORTE: 'Corte', LEITE: 'Leite',
      PRENHEZ: 'Prenhez', OUTROS: 'Outros', DOACAO: 'Doação'
    };
    return tipo ? labels[tipo] ?? tipo : '—';
  }

  private normalizarResumo(data: LeilaoResumo): LeilaoResumo {
    return {
      ...data,
      especieNome: data.especieNome || data.especie?.nome,
      condicaoDescricao: data.condicaoDescricao || data.condicao?.descricao,
      taxa: data.taxa ?? data.taxaPadrao?.taxa,
      comissaoVenda: data.comissaoVenda ?? data.taxaPadrao?.comissaoVenda,
      comissaoCompra: data.comissaoCompra ?? data.taxaPadrao?.comissaoCompra,
      gta: data.gta ?? data.taxaPadrao?.gta,
      lotes: data.lotes || [],
    };
  }
}
