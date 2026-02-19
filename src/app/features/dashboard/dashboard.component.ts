import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../core/services/cliente.service';
import { FazendaService } from '../../core/services/fazenda.service';
import { LeilaoService } from '../../core/services/leilao.service';
import { LoteService } from '../../core/services/lote.service';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private fazendaService = inject(FazendaService);
  private leilaoService = inject(LeilaoService);
  private loteService = inject(LoteService);

  totalClientes = 0;
  totalFazendas = 0;
  totalLeiloes = 0;
  totalLotes = 0;
  totalAnimais = 0;
  valorTotal = 0;

  ultimosLeiloes: any[] = [];
  ultimosLotes: any[] = [];

  ngOnInit() {
    forkJoin({
      clientes: this.clienteService.listar().pipe(catchError(() => of([]))),
      fazendas: this.fazendaService.listar().pipe(catchError(() => of([]))),
      leiloes: this.leilaoService.listar().pipe(catchError(() => of([]))),
      lotes: this.loteService.listar().pipe(catchError(() => of([])))
    }).subscribe(({ clientes, fazendas, leiloes, lotes }) => {
      this.totalClientes = clientes.length;
      this.totalFazendas = fazendas.length;
      this.totalLeiloes = leiloes.length;
      this.totalLotes = lotes.length;
      this.totalAnimais = lotes.reduce((sum, l) => sum + (l.qntd_animais || 0), 0);
      this.valorTotal = lotes.reduce((sum, l) => sum + (l.preco_compra || 0), 0);
      this.ultimosLeiloes = leiloes.slice(-5).reverse();
      this.ultimosLotes = lotes.slice(-5).reverse();
    });
  }
}
