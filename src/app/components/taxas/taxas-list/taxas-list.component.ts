import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Taxas } from '../../../core/models/entities.model';
import { TaxasService } from '../../../core/services/taxas.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-taxas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './taxas-list.component.html'
})
export class TaxasListComponent implements OnInit {
  private service = inject(TaxasService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  taxas: Taxas[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.taxas = data,
      error: () => this.alert.error('Erro ao carregar taxas')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir esta taxa?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Taxa excluída!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir taxa')
      });
    }
  }
}
