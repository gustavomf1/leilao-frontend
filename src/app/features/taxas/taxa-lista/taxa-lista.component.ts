import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaxasService } from '../../../core/services/taxas.service';
import { Taxas } from '../../../core/models/taxas.model';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-taxa-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './taxa-lista.component.html',
  styleUrl: './taxa-lista.component.css'
})
export class TaxaListaComponent implements OnInit {
  private service = inject(TaxasService);
  private alert = inject(AlertService);
  taxas: Taxas[] = [];
  filtro = '';

  ngOnInit() { this.carregar(); }

  carregar() {
    this.service.listar().subscribe({
      next: data => this.taxas = data,
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar taxas')
    });
  }

  get taxasFiltradas(): Taxas[] {
    if (!this.filtro) return this.taxas;
    const f = this.filtro.toLowerCase();
    return this.taxas.filter(t => t.tipo_cliente.toLowerCase().includes(f));
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir esta taxa?')) {
      this.service.excluir(id).subscribe({
        next: () => this.carregar(),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir taxa')
      });
    }
  }
}
