import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  TableModule, TableDirective,
  CardBodyComponent, CardComponent
} from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Usuario } from '../../../core/models/entities.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.html'
})
export class UsuariosListComponent implements OnInit {
  private service = inject(UsuarioService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  usuarios: Usuario[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => this.alert.error('Erro ao carregar usuários')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir este usuário?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Usuário excluído!'); this.carregar(); },
        error: (err) => this.alert.error('Erro ao excluir usuário')
      });
    }
  }
}