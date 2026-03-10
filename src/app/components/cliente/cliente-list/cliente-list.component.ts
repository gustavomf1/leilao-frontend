import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from '../../../core/models/entities.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './cliente-list.component.html'
})
export class ClientesListComponent implements OnInit {
  private service = inject(ClienteService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  clientes$ = new BehaviorSubject<Cliente[]>([]);

  ngOnInit() {
    console.log('>>> ngOnInit chamado');
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => {
        this.zone.run(() => this.clientes$.next(data));
      },
      error: () => this.alert.error('Erro ao carregar clientes')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este cliente?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Cliente excluído!');
          this.clientes$.next(this.clientes$.value.filter(c => c.id !== id));
        },
        error: () => this.alert.error('Erro ao excluir cliente')
      });
    });
  }
}