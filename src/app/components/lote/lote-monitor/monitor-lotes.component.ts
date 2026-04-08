import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { LoteService } from '../../../core/services/lote.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { BehaviorSubject } from 'rxjs';
import { CardModule, BadgeModule, SpinnerModule, GridModule, ButtonDirective, FormModule, ModalModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircle, faLayerGroup, faHashtag, faTag,
  faPaw, faDollarSign, faUser, faHorse,
  faPlus, faPencil, faArrowRight, faTrash, faCheck, faEye, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { StatusLote, STATUS_LOTE_LABELS, STATUS_LOTE_COLOR } from '../../../core/models/entities.model';

@Component({
  selector: 'app-monitor-lotes',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, FormsModule, CardModule, BadgeModule, SpinnerModule, GridModule, ButtonDirective, FormModule, ModalModule, FontAwesomeModule],
  templateUrl: './monitor-lotes.component.html',
  styleUrl: './monitor-lotes.component.css'
})
export class MonitorLotesComponent implements OnInit {
  // null = carregando, [] ou [...] = carregado
  lotes$ = new BehaviorSubject<any[] | null>(null);

  filtroStatus: StatusLote | 'TODOS' | 'NAO_VENDIDO' = 'TODOS';
  precoInput: Record<number, number | null> = {};

  readonly STATUS_LABELS = STATUS_LOTE_LABELS;
  readonly STATUS_COLOR  = STATUS_LOTE_COLOR;

  readonly statusOpcoes: Array<{ value: StatusLote | 'TODOS' | 'NAO_VENDIDO'; label: string }> = [
    { value: 'TODOS',                  label: 'Todos'                  },
    { value: 'AGUARDANDO_ESCRITORIO',  label: 'Aguardando Escritório'  },
    { value: 'AGUARDANDO_LANCE',       label: 'Aguardando Lance'       },
    { value: 'FINALIZADO',             label: 'Finalizado'             },
    { value: 'NAO_VENDIDO',            label: 'Não Vendido'            },
  ];

  readonly faCircle     = faCircle;
  readonly faLayerGroup = faLayerGroup;
  readonly faHashtag    = faHashtag;
  readonly faTag        = faTag;
  readonly faPaw        = faPaw;
  readonly faDollarSign = faDollarSign;
  readonly faUser       = faUser;
  readonly faHorse      = faHorse;
  readonly faPlus       = faPlus;
  readonly faPencil     = faPencil;
  readonly faArrowRight = faArrowRight;
  readonly faTrash      = faTrash;
  readonly faCheck      = faCheck;
  readonly faEye        = faEye;
  readonly faTimes      = faTimes;

  loteDetalhes: any | null = null;
  modalDetalhesVisivel = false;

  private wsService   = inject(LoteWebsocketService);
  private loteService = inject(LoteService);
  private alert       = inject(AlertService);
  auth                = inject(AuthService);

  get lotesFiltrados(): any[] {
    const lotes = this.lotes$.value ?? [];
    if (this.filtroStatus === 'TODOS') return lotes;
    if (this.filtroStatus === 'NAO_VENDIDO') return lotes.filter(l => l.naoVendidoNoLeilao === 'S');
    return lotes.filter(l => l.status === this.filtroStatus);
  }

  ngOnInit(): void {
    this.loteService.listar().subscribe({
      next: (dados) => this.lotes$.next(dados),
      error: ()      => this.lotes$.next([])
    });

    this.wsService.novoLoteSubject.subscribe((novoLote) => {
      const atual = this.lotes$.value ?? [];
      const idx   = atual.findIndex(l => l.id === novoLote.id);
      if (idx >= 0) {
        const atualizado = [...atual];
        atualizado[idx]  = novoLote;
        this.lotes$.next(atualizado);
      } else {
        this.lotes$.next([novoLote, ...atual]);
      }
    });
  }

  setFiltro(status: StatusLote | 'TODOS' | 'NAO_VENDIDO') {
    this.filtroStatus = status;
  }

  statusLabel(status: any): string {
    return this.STATUS_LABELS[status as StatusLote] ?? status ?? '';
  }

  statusColor(status: any): string {
    return this.STATUS_COLOR[status as StatusLote] ?? 'secondary';
  }

  abrirDetalhes(lote: any) {
    this.loteDetalhes = lote;
    this.modalDetalhesVisivel = true;
  }

  fecharDetalhes() {
    this.modalDetalhesVisivel = false;
    this.loteDetalhes = null;
  }

  confirmarPreco(id: number) {
    const preco = this.precoInput[id];
    if (!preco || preco <= 0) {
      this.alert.error('Informe um preço válido');
      return;
    }
    this.loteService.registrarPreco(id, preco).subscribe({
      next: (loteAtualizado) => {
        this._substituir(loteAtualizado);
        delete this.precoInput[id];
        this.alert.success('Valor do lance registrado! Lote finalizado.');
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao registrar preço')
    });
  }

  avancarStatus(id: number) {
    this.loteService.avancarStatus(id).subscribe({
      next: (loteAtualizado) => {
        this._substituir(loteAtualizado);
        this.alert.success(`Status: ${this.STATUS_LABELS[loteAtualizado.status!]}`);
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao avançar status')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este lote?', () => {
      this.loteService.deletar(id).subscribe({
        next: () => {
          this.lotes$.next((this.lotes$.value ?? []).filter(l => l.id !== id));
          this.alert.success('Lote excluído!');
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir lote')
      });
    });
  }

  private _substituir(lote: any) {
    const atual = this.lotes$.value ?? [];
    const idx   = atual.findIndex(l => l.id === lote.id);
    if (idx >= 0) {
      const novo  = [...atual];
      novo[idx]   = lote;
      this.lotes$.next(novo);
    }
  }
}
