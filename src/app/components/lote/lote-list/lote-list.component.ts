import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule, BadgeModule, GridModule, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import {
  faPlus, faPencil, faTrash,
  faHashtag, faTag, faPaw, faDollarSign,
  faUser, faHorse, faLayerGroup, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusLote, STATUS_LOTE_LABELS, STATUS_LOTE_COLOR } from '../../../core/models/entities.model';

@Component({
  selector: 'app-lotes-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, CardModule, BadgeModule, GridModule, ButtonDirective, FontAwesomeModule],
  templateUrl: './lote-list.component.html',
  styleUrl: './lote-list.component.css'
})
export class LotesListComponent implements OnInit {
  private service   = inject(LoteService);
  private wsService = inject(LoteWebsocketService);
  private alert     = inject(AlertService);
  private zone      = inject(NgZone);
  auth              = inject(AuthService);

  lotes: any[]    = [];
  lotes$          = new Subject<any[]>();
  filtroStatus: StatusLote | 'TODOS' | 'NAO_VENDIDO' = 'TODOS';

  readonly STATUS_LABELS = STATUS_LOTE_LABELS;
  readonly STATUS_COLOR  = STATUS_LOTE_COLOR;

  readonly faPlus        = faPlus;
  readonly faPencil      = faPencil;
  readonly faTrash       = faTrash;
  readonly faHashtag     = faHashtag;
  readonly faTag         = faTag;
  readonly faPaw         = faPaw;
  readonly faDollarSign  = faDollarSign;
  readonly faUser        = faUser;
  readonly faHorse       = faHorse;
  readonly faLayerGroup  = faLayerGroup;
  readonly faArrowRight  = faArrowRight;

  readonly statusDisponiveis: Array<StatusLote | 'TODOS' | 'NAO_VENDIDO'> = [
    'TODOS', 'AGUARDANDO_ESCRITORIO', 'AGUARDANDO_LANCE', 'FINALIZADO', 'NAO_VENDIDO'
  ];

  get lotesFiltrados(): any[] {
    if (this.filtroStatus === 'TODOS') return this.lotes;
    if (this.filtroStatus === 'NAO_VENDIDO') return this.lotes.filter(l => l.naoVendidoNoLeilao === 'S');
    return this.lotes.filter(l => l.status === this.filtroStatus);
  }

  ngOnInit() {
    this.service.listar().subscribe({
      next: (dados) => {
        this.lotes = dados;
        this.lotes$.next([...this.lotes]);
      }
    });

    this.wsService.novoLoteSubject.subscribe({
      next: (novoLote) => {
        this.zone.run(() => {
          // Atualiza se já existe, senão adiciona no topo
          const idx = this.lotes.findIndex(l => l.id === novoLote.id);
          if (idx >= 0) {
            this.lotes[idx] = novoLote;
          } else {
            this.lotes = [novoLote, ...this.lotes];
          }
          this.lotes$.next([...this.lotes]);
        });
      }
    });

    // Filtro padrão por perfil
    if (this.auth.hasPermission('LOTES', 'EDITAR') && !this.auth.isAdmin()) {
      this.filtroStatus = 'AGUARDANDO_ESCRITORIO';
    }
  }

  setFiltro(status: StatusLote | 'TODOS' | 'NAO_VENDIDO') {
    this.filtroStatus = status;
  }

  avancarStatus(id: number) {
    this.service.avancarStatus(id).subscribe({
      next: (loteAtualizado) => {
        this.zone.run(() => {
          const idx = this.lotes.findIndex(l => l.id === id);
          if (idx >= 0) this.lotes[idx] = loteAtualizado;
          this.lotes$.next([...this.lotes]);
          this.alert.success(`Status avançado para: ${this.STATUS_LABELS[loteAtualizado.status]}`);
        });
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao avançar status')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este lote?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Lote excluído!');
          this.lotes = this.lotes.filter(l => l.id !== id);
          this.lotes$.next([...this.lotes]);
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir lote')
      });
    });
  }
}
