import { ChangeDetectorRef, Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  TableModule, TableDirective,
  CardBodyComponent, CardComponent
} from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Usuario } from '../../../core/models/entities.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UsuariosDetailsComponent } from '../usuario-details/usuario-details.component';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TableModule, TableDirective,
    ButtonDirective, CardBodyComponent, CardComponent,
    FontAwesomeModule, UsuariosDetailsComponent
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.html'
})
export class UsuariosListComponent implements OnInit {
  private service = inject(UsuarioService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faXmark = faXmark;

  usuarios: Usuario[] = [];
  public usuarios$ = new Subject<Usuario[]>();

  // Drawer
  drawerAberto = false;
  drawerUsuarioId?: number;

  ngOnInit() {
    this.carregar();
    this.cdr.detectChanges();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuarios$.next(this.usuarios);
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar usuários')
    });
  }

  abrirDrawerNovo() {
    this.drawerUsuarioId = undefined;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  abrirDrawerEditar(id: number) {
    this.drawerUsuarioId = id;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onUsuarioSalvo() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir este usuário?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Usuário excluído!'); this.carregar(); },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir usuário')
      });
    }
  }
}
