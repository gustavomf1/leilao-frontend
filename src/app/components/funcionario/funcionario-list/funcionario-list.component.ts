import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
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
  private zone = inject(NgZone);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  funcionarios$ = new BehaviorSubject<Funcionario[]>([]);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.funcionarios$.next(data)),
      error: () => this.alert.error('Erro ao carregar funcionários')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este funcionário?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Funcionário excluído!');
          this.funcionarios$.next(this.funcionarios$.value.filter(f => f.id !== id));
        },
        error: () => this.alert.error('Erro ao excluir funcionário')
      });
    });
  }
}