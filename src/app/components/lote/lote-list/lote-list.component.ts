import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule, BadgeModule, GridModule, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import {
  faPlus, faPencil, faTrash,
  faHashtag, faTag, faPaw, faDollarSign,
  faUser, faHorse, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { Lote } from '../../../core/models/entities.model';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lotes-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, CardModule, BadgeModule, GridModule, ButtonDirective, FontAwesomeModule],
  templateUrl: './lote-list.component.html',
  styleUrl: './lote-list.component.css'
})
export class LotesListComponent implements OnInit {
  private service = inject(LoteService);
  private wsService = inject(LoteWebsocketService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);

  lotes: any[] = [];
  lotes$ = new Subject<any[]>();

  readonly faPlus       = faPlus;
  readonly faPencil     = faPencil;
  readonly faTrash      = faTrash;
  readonly faHashtag    = faHashtag;
  readonly faTag        = faTag;
  readonly faPaw        = faPaw;
  readonly faDollarSign = faDollarSign;
  readonly faUser       = faUser;
  readonly faHorse      = faHorse;
  readonly faLayerGroup = faLayerGroup;

  ngOnInit() {
    // 1. Carrega todos do banco
    this.service.listar().subscribe({
      next: (dados) => {
        this.lotes = dados;
        this.lotes$.next([...this.lotes]);
      }
    });

    // 2. Ouve novos em tempo real
    this.wsService.novoLoteSubject.subscribe({
      next: (novoLote) => {
        this.zone.run(() => {
          console.log('>>> WebSocket recebeu:', novoLote);
          this.lotes = [novoLote, ...this.lotes];
          this.lotes$.next([...this.lotes]);
        });
      }
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
        error: () => this.alert.error('Erro ao excluir lote')
      });
    });
  }
}