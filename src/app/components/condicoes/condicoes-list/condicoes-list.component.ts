import { Component, OnInit, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Condicoes } from '../../../core/models/entities.model';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { CondicoesDetailsComponent } from '../condicoes-details/condicoes-details.component';

@Component({
  selector: 'app-condicoes-list',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective,
    ButtonDirective, CardBodyComponent, CardComponent,
    FontAwesomeModule, CondicoesDetailsComponent
  ],
  templateUrl: './condicoes-list.component.html'
})
export class CondicoesListComponent implements OnInit {
  private service = inject(CondicoesService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faXmark = faXmark;

  condicoes$ = new BehaviorSubject<Condicoes[]>([]);

  // Drawer
  drawerAberto = false;
  drawerCondicaoId?: number;

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.condicoes$.next(data)),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar condições')
    });
  }

  abrirDrawerNovo() {
    this.drawerCondicaoId = undefined;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  abrirDrawerEditar(id: number) {
    this.drawerCondicaoId = id;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onCondicaoSalva() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir esta condição?', () => {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Condição excluída!'); this.carregar(); },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir condição')
      });
    });
  }
}
