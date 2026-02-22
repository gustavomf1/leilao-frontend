import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Funcionario } from '../../../core/models/entities.model';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-funcionarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './funcionario-list.component.html'
})
export class FuncionariosListComponent implements OnInit {
  private service = inject(FuncionarioService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  funcionarios: Funcionario[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.funcionarios = data,
      error: () => this.alert.error('Erro ao carregar funcionários')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir este funcionário?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Funcionário excluído!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir funcionário')
      });
    }
  }
}
