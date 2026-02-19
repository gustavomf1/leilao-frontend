import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { Condicoes } from '../../../core/models/condicoes.model';

@Component({
  selector: 'app-condicao-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './condicao-lista.component.html',
  styleUrl: './condicao-lista.component.css'
})
export class CondicaoListaComponent implements OnInit {
  private service = inject(CondicoesService);
  condicoes: Condicoes[] = [];
  filtro = '';

  ngOnInit() { this.carregar(); }

  carregar() {
    this.service.listar().subscribe(data => this.condicoes = data);
  }

  get condicoesFiltradas(): Condicoes[] {
    if (!this.filtro) return this.condicoes;
    const f = this.filtro.toLowerCase();
    return this.condicoes.filter(c => c.tipo.toLowerCase().includes(f) || c.descricao.toLowerCase().includes(f));
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir esta condição?')) {
      this.service.excluir(id).subscribe(() => this.carregar());
    }
  }
}
