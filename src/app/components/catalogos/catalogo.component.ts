import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, FormModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilePdf, faBook } from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../core/services/leilao.service';
import { Leilao } from '../../core/models/entities.model';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective, FormModule, FontAwesomeModule],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent implements OnInit {
  private leilaoService = inject(LeilaoService);

  faFilePdf = faFilePdf;
  faBook = faBook;

  leiloes: Leilao[] = [];
  selectedLeilaoId?: number;
  selectedTipo: 1 | 2 | 3 = 1;

  tiposCatalogo = [
    { value: 1, label: 'Catálogo 1 — Listagem Completa' },
    { value: 2, label: 'Catálogo 2 — Resumo por Vendedor' },
    { value: 3, label: 'Catálogo 3 — Ficha Técnica' },
  ];

  ngOnInit() {
    this.leilaoService.listar().subscribe({
      next: (data) => this.leiloes = data,
    });
  }

  get canGenerate(): boolean {
    return !!this.selectedLeilaoId;
  }

  abrirCatalogo() {
    if (!this.selectedLeilaoId) return;
    const url = `${environment.backendUrl}/api/catalogos/catalogo${this.selectedTipo}?leilaoId=${this.selectedLeilaoId}`;
    window.open(url, '_blank');
  }
}
