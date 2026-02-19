import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoteService } from '../../../core/services/lote.service';
import { Lote } from '../../../core/models/lote.model';

@Component({
  selector: 'app-lote-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lote-lista.component.html',
  styleUrl: './lote-lista.component.css'
})
export class LoteListaComponent implements OnInit {
  private service = inject(LoteService);
  lotes: Lote[] = [];
  filtro = '';

  ngOnInit() { this.carregar(); }

  carregar() {
    this.service.listar().subscribe(data => this.lotes = data);
  }

  get lotesFiltrados(): Lote[] {
    if (!this.filtro) return this.lotes;
    const f = this.filtro.toLowerCase();
    return this.lotes.filter(l =>
      l.codigo.toLowerCase().includes(f) ||
      l.raca.toLowerCase().includes(f) ||
      l.especie.toLowerCase().includes(f) ||
      l.categoria_animal.toLowerCase().includes(f)
    );
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir este lote?')) {
      this.service.excluir(id).subscribe(() => this.carregar());
    }
  }
}
