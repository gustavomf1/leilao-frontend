import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faToggleOn, faToggleOff, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Especie } from '../../../core/models/entities.model';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { EspecieDetailsComponent } from '../especie-details/especie-details.component';

@Component({
  selector: 'app-especie-list',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective,
    ButtonDirective, CardBodyComponent, CardComponent,
    FontAwesomeModule, EspecieDetailsComponent
  ],
  templateUrl: './especie-list.component.html',
})
export class EspecieListComponent implements OnInit {
  private service = inject(EspecieService);
  private alert = inject(AlertService);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faXmark = faXmark;

  especies$ = new BehaviorSubject<Especie[]>([]);

  // Drawer
  drawerAberto = false;
  drawerEspecieId?: number;

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listarTodas().subscribe({
      next: (data) => this.especies$.next(data),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar espécies'),
    });
  }

  abrirDrawerNovo() {
    this.drawerEspecieId = undefined;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  abrirDrawerEditar(id: number) {
    this.drawerEspecieId = id;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onEspecieSalva() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }

  toggleInativo(especie: Especie) {
    const acao = especie.inativo === 'S' ? 'ativar' : 'inativar';
    this.alert.confirm(`Deseja ${acao} a espécie "${especie.nome}"?`, () => {
      this.service.inativar(especie.id!).subscribe({
        next: () => { this.alert.success(`Espécie ${acao === 'ativar' ? 'ativada' : 'inativada'}!`); this.carregar(); },
        error: (err) => this.alert.error(err.error?.mensagem || `Erro ao ${acao} espécie`),
      });
    });
  }
}
