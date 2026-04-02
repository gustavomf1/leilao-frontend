import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { Condicoes } from '../../../core/models/condicoes.model';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-condicao-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './condicao-lista.component.html',
  styleUrl: './condicao-lista.component.css'
})
export class CondicaoListaComponent implements OnInit {
  private service = inject(CondicoesService);
  private alert = inject(AlertService);
  condicoes: Condicoes[] = [];
  filtro = '';

  ngOnInit() { this.carregar(); }

  carregar() {
    this.service.listar().subscribe({
      next: data => this.condicoes = data,
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar condições')
    });
  }

  get condicoesFiltradas(): Condicoes[] {
    if (!this.filtro) return this.condicoes;
    const f = this.filtro.toLowerCase();
    return this.condicoes.filter(c =>
      c.descricao.toLowerCase().includes(f) ||
      (c.tipoCondicao && c.tipoCondicao.toLowerCase().includes(f))
    );
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir esta condição?')) {
      this.service.excluir(id).subscribe({
        next: () => this.carregar(),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir condição')
      });
    }
  }
}
