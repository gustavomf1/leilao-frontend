import { Component, OnInit, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Fazenda } from '../../../core/models/entities.model';
import { FazendaService } from '../../../core/services/fazenda.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { FazendasDetailsComponent } from '../fazenda-details/fazenda-details.component';

@Component({
  selector: 'app-fazendas-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TableModule, TableDirective,
    ButtonDirective, CardBodyComponent, CardComponent,
    FontAwesomeModule, FazendasDetailsComponent
  ],
  templateUrl: './fazenda-list.component.html'
})
export class FazendasListComponent implements OnInit {
  private service = inject(FazendaService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faXmark = faXmark;

  fazendas$ = new BehaviorSubject<Fazenda[]>([]);

  // Drawer
  drawerAberto = false;
  drawerFazendaId?: number;

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.fazendas$.next(data)),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar fazendas')
    });
  }

  abrirDrawerNovo() {
    this.drawerFazendaId = undefined;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  abrirDrawerEditar(id: number) {
    this.drawerFazendaId = id;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onFazendaSalva() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir esta fazenda?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Fazenda excluída!');
          this.fazendas$.next(this.fazendas$.value.filter(f => f.id !== id));
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir fazenda')
      });
    });
  }
}
