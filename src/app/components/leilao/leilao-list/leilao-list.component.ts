import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Leilao } from '../../../core/models/entities.model';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-leiloes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './leilao-list.component.html'
})
export class LeiloesListComponent implements OnInit {
  private service = inject(LeilaoService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  leiloes: Leilao[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.leiloes = data,
      error: () => this.alert.error('Erro ao carregar leilões')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir este leilão?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Leilão excluído!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir leilão')
      });
    }
  }
}
