import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { LoteService } from '../../../core/services/lote.service'; // Importe seu serviço HTTP

@Component({
  selector: 'app-monitor-lotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitor-lotes.component.html',
  styleUrl: './monitor-lotes.component.css'
})
export class MonitorLotesComponent implements OnInit {
  lotes: any[] = [];
  
  private wsService = inject(LoteWebsocketService);
  private loteService = inject(LoteService); // Injeta o serviço de API

  ngOnInit(): void {
    // 1. CARREGA OS ÚLTIMOS 10 DO BANCO (HISTÓRICO)
    this.loteService.listar().subscribe({
      next: (dados) => {
        // Pega apenas os 10 últimos da lista que vem do banco
        // Assumindo que o banco já manda ordenado por ID desc, ou usamos reverse
        this.lotes = dados.slice(-10).reverse();
      }
    });

    // 2. OUVE OS NOVOS EM TEMPO REAL (STREAMING)
    this.wsService.novoLoteSubject.subscribe({
      next: (novoLote) => {
        console.log('Novo lote no monitor:', novoLote);
        
        // Adiciona o novo no topo e remove o 11º para manter apenas 10
        const novaLista = [novoLote, ...this.lotes];
        this.lotes = novaLista.slice(0, 10);
      }
    });
  }
}