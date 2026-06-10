import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faToggleOn, faToggleOff, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Raca } from '../../../core/models/entities.model';
import { RacaService } from '../../../core/services/raca.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { RacaDetailsComponent } from '../raca-details/raca-details.component';

@Component({
  selector: 'app-racas-list',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective,
    ButtonDirective, CardBodyComponent, CardComponent,
    FontAwesomeModule, RacaDetailsComponent
  ],
  templateUrl: './raca-list.component.html',
})
export class RacaListComponent implements OnInit {
  private service = inject(RacaService);
  private alert = inject(AlertService);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faXmark = faXmark;

  racas$ = new BehaviorSubject<Raca[]>([]);

  // Drawer
  drawerAberto = false;
  drawerRacaId?: number;

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listarTodas().subscribe({
      next: (data) => this.racas$.next(data),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar raças'),
    });
  }

  abrirDrawerNovo() {
    this.drawerRacaId = undefined;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  abrirDrawerEditar(id: number) {
    this.drawerRacaId = id;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onRacaSalva() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }

  toggleInativo(raca: Raca) {
    const acao = raca.inativo === 'S' ? 'ativar' : 'inativar';
    this.alert.confirm(`Deseja ${acao} a raça "${raca.nome}"?`, () => {
      this.service.toggleInativo(raca.id!).subscribe({
        next: () => { this.alert.success(`Raça ${acao === 'ativar' ? 'ativada' : 'inativada'}!`); this.carregar(); },
        error: (err) => this.alert.error(err.error?.mensagem || `Erro ao ${acao} raça`),
      });
    });
  }
}
