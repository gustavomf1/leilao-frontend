import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeilaoService } from '../../../core/services/leilao.service';
import { Leilao } from '../../../core/models/leilao.model';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-leilao-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './leilao-lista.component.html',
  styleUrl: './leilao-lista.component.css'
})
export class LeilaoListaComponent implements OnInit {
  private service = inject(LeilaoService);
  private alert = inject(AlertService);
  leiloes: Leilao[] = [];
  filtro = '';

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: data => this.leiloes = data,
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar leilões')
    });
  }

  get leiloesFiltrados(): Leilao[] {
    if (!this.filtro) return this.leiloes;
    const f = this.filtro.toLowerCase();
    return this.leiloes.filter(l =>
      l.local.toLowerCase().includes(f) ||
      l.cidade.toLowerCase().includes(f) ||
      l.descricao.toLowerCase().includes(f)
    );
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir este leilão?')) {
      this.service.excluir(id).subscribe({
        next: () => this.carregar(),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir leilão')
      });
    }
  }
}
