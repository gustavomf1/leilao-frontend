import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe} from '@angular/common';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { LoteService } from '../../../core/services/lote.service'; // Importe seu serviço HTTP
import { Subject } from 'rxjs';
import {
  CardModule,
  BadgeModule,
  SpinnerModule,
  GridModule,
} from '@coreui/angular';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircle,
  faLayerGroup,
  faHashtag,
  faTag,
  faPaw,
  faDollarSign,
  faUser,
  faHorse,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-monitor-lotes',
  standalone: true,
  imports: [CommonModule,
    CurrencyPipe,
    CardModule,
    BadgeModule,
    SpinnerModule,
    GridModule,
    FontAwesomeModule,],
  templateUrl: './monitor-lotes.component.html',
  styleUrl: './monitor-lotes.component.css'
})
export class MonitorLotesComponent implements OnInit {
  lotes: any[] = [];
  lotes$ = new Subject<any[]>();

  readonly faCircle      = faCircle;
  readonly faLayerGroup  = faLayerGroup;
  readonly faHashtag     = faHashtag;
  readonly faTag         = faTag;
  readonly faPaw         = faPaw;
  readonly faDollarSign  = faDollarSign;
  readonly faUser        = faUser;
  readonly faHorse       = faHorse;

  private wsService = inject(LoteWebsocketService);
  private loteService = inject(LoteService); // Injeta o serviço de API
  private zone = inject(NgZone);

  ngOnInit(): void {
    // 1. CARREGA OS ÚLTIMOS 10 DO BANCO (HISTÓRICO)
    this.loteService.listar().subscribe({
      next: (dados) => {
        // Pega apenas os 10 últimos da lista que vem do banco
        // Assumindo que o banco já manda ordenado por ID desc, ou usamos reverse
        this.lotes = dados.slice(-10).reverse();
        this.lotes$.next([...this.lotes]);
      }
    });

    // 2. OUVE OS NOVOS EM TEMPO REAL (STREAMING)
    this.wsService.novoLoteSubject.subscribe({
      next: (novoLote) => {
        this.zone.run(() => {
          console.log('Novo lote no monitor:', novoLote);

          // Cria uma nova referência de array para o Angular notar a mudança
          this.lotes = [novoLote, ...this.lotes].slice(0, 10);
          this.lotes$.next([...this.lotes])
          console.log('Lista atualizada:', this.lotes);
        });
      }
    });
  }
}
