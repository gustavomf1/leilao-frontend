import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import {
  CardModule, BadgeComponent, ButtonDirective,
  GridModule, TableModule, TableDirective,
  ModalModule, FormModule
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGavel, faArrowLeft, faPlay, faStop,
  faCheck, faBan, faMapMarkerAlt, faCalendarAlt,
  faDollarSign, faListOl, faLink
} from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../../core/services/leilao.service';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeilaoDetalhes, Lote, STATUS_LEILAO_LABELS, STATUS_LEILAO_COLOR } from '../../../core/models/entities.model';

@Component({
  selector: 'app-evento-leilao',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    CardModule, BadgeComponent, ButtonDirective,
    GridModule, TableModule, TableDirective,
    ModalModule, FormModule,
    FontAwesomeModule
  ],
  templateUrl: './evento-leilao.component.html',
  styleUrl: './evento-leilao.component.scss'
})
export class EventoLeilaoComponent implements OnInit, OnDestroy {
  private leilaoService = inject(LeilaoService);
  private loteService = inject(LoteService);
  private wsService = inject(LoteWebsocketService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zone = inject(NgZone);
  auth = inject(AuthService);

  faGavel = faGavel;
  faArrowLeft = faArrowLeft;
  faPlay = faPlay;
  faStop = faStop;
  faCheck = faCheck;
  faBan = faBan;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendarAlt = faCalendarAlt;
  faDollarSign = faDollarSign;
  faListOl = faListOl;
  faLink = faLink;

  leilao?: LeilaoDetalhes;
  lotes: Lote[] = [];
  loading$ = new BehaviorSubject<boolean>(true);
  leilaoId!: number;

  // Map de valores de lance por loteId
  lancesValues: Record<number, number | null> = {};

  statusLabels = STATUS_LEILAO_LABELS;
  statusColors = STATUS_LEILAO_COLOR;

  get emAndamento(): boolean {
    return this.leilao?.status === 'EM_ANDAMENTO';
  }

  get isAberto(): boolean {
    return this.leilao?.status === 'ABERTO';
  }

  get isFinalizado(): boolean {
    return this.leilao?.status === 'FINALIZADO';
  }

  get lotesAguardandoLance(): Lote[] {
    return this.lotes.filter(l => l.status === 'AGUARDANDO_LANCE');
  }

  get lotesFinalizados(): Lote[] {
    return this.lotes.filter(l => l.status === 'FINALIZADO');
  }

  get totalFinalizados(): number {
    return this.lotesFinalizados.length;
  }

  get totalAguardando(): number {
    return this.lotesAguardandoLance.length;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/leiloes/lista']);
      return;
    }
    this.leilaoId = +id;
    this.carregarDados();

    this.wsService.conectar();
    this.wsService.novoLoteSubject.subscribe((novoLote: Lote) => {
      this.zone.run(() => {
        if (novoLote.leilaoId !== this.leilaoId) return;
        this.carregarLotes();
      });
    });
  }

  ngOnDestroy() {
    this.wsService.desconectar();
  }

  carregarDados() {
    this.loading$.next(true);
    this.leilaoService.buscarDetalhes(this.leilaoId).subscribe({
      next: (leilao) => {
        this.leilao = leilao;
        this.carregarLotes();
      },
      error: (err) => {
        this.alert.error(err.error?.mensagem || 'Erro ao carregar leilão');
        this.loading$.next(false);
      }
    });
  }

  private carregarLotes() {
    this.leilaoService.buscarResumo(this.leilaoId).subscribe({
      next: (resumo: any) => {
        this.lotes = resumo.lotes || [];
        // Inicializa valores de lance
        for (const lote of this.lotes) {
          if (lote.id && !this.lancesValues[lote.id]) {
            this.lancesValues[lote.id] = null;
          }
        }
        this.loading$.next(false);
      },
      error: (err: any) => {
        this.alert.error(err.error?.mensagem || 'Erro ao carregar lotes');
        this.loading$.next(false);
      }
    });
  }

  iniciarLeilao() {
    this.alert.confirm('Deseja iniciar o evento do leilão? Os lotes serão abertos para lances.', () => {
      this.leilaoService.iniciarLeilao(this.leilaoId).subscribe({
        next: (leilao) => {
          this.leilao = leilao;
          this.alert.success('Leilão iniciado com sucesso!');
          this.carregarLotes();
        },
        error: (err) => {
          this.alert.error(err.error?.mensagem || err.error?.message || 'Erro ao iniciar leilão');
        }
      });
    }, 'Iniciar', 'success');
  }

  encerrarLeilao() {
    const lotesRestantes = this.totalAguardando;
    const msg = lotesRestantes > 0
      ? `Ainda existem ${lotesRestantes} lote(s) sem lance. Ao encerrar, serão marcados como "Não vendido no leilão". Deseja continuar?`
      : 'Todos os lotes foram arrematados. Deseja encerrar o leilão?';

    this.alert.confirm(msg, () => {
      this.leilaoService.encerrarLeilao(this.leilaoId).subscribe({
        next: (leilao) => {
          this.leilao = leilao;
          this.alert.success('Leilão encerrado com sucesso!');
          this.carregarLotes();
        },
        error: (err) => {
          this.alert.error(err.error?.mensagem || err.error?.message || 'Erro ao encerrar leilão');
        }
      });
    }, 'Encerrar', 'danger');
  }

  gerarLink() {
    const url = `${window.location.origin}/#/publico/evento/${this.leilaoId}`;
    navigator.clipboard.writeText(url);
    this.alert.success('Link copiado para a área de transferência!');
  }

  confirmarLance(lote: Lote) {
    if (!lote.id) return;
    const valor = this.lancesValues[lote.id];
    if (!valor || valor <= 0) {
      this.alert.warning('Informe um valor válido para o lance.');
      return;
    }

    this.alert.confirm(`Confirmar lance de R$ ${valor.toFixed(2)} para o lote ${lote.codigo}?`, () => {
      this.loteService.registrarPreco(lote.id!, valor).subscribe({
        next: () => {
          this.alert.success(`Lance registrado para o lote ${lote.codigo}!`);
          this.carregarLotes();
        },
        error: (err: any) => {
          this.alert.error(err.error?.mensagem || err.error?.message || 'Erro ao registrar lance');
        }
      });
    }, 'Confirmar', 'success');
  }
}
