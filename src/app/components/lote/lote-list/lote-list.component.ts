import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Lote } from '../../../core/models/entities.model';
import { LoteService } from '../../../core/services/lote.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lotes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './lote-list.component.html'
})
export class LotesListComponent implements OnInit {
  private service = inject(LoteService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  lotes: Lote[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.lotes = data,
      error: () => this.alert.error('Erro ao carregar lotes')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir este lote?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Lote excluído!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir lote')
      });
    }
  }
}
