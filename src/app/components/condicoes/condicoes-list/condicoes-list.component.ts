import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Condicoes } from '../../../core/models/entities.model';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-condicoes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './condicoes-list.component.html'
})
export class CondicoesListComponent implements OnInit {
  private service = inject(CondicoesService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  condicoes: Condicoes[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.condicoes = data,
      error: () => this.alert.error('Erro ao carregar condições')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir esta condição?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Condição excluída!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir condição')
      });
    }
  }
}
