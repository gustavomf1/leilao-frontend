import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Especie } from '../../../core/models/entities.model';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-especie-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
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

  especies$ = new BehaviorSubject<Especie[]>([]);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listarTodas().subscribe({
      next: (data) => this.especies$.next(data),
      error: () => this.alert.error('Erro ao carregar espécies'),
    });
  }

  toggleInativo(especie: Especie) {
    const acao = especie.inativo === 'S' ? 'ativar' : 'inativar';
    this.alert.confirm(`Deseja ${acao} a espécie "${especie.nome}"?`, () => {
      this.service.inativar(especie.id!).subscribe({
        next: () => { this.alert.success(`Espécie ${acao === 'ativar' ? 'ativada' : 'inativada'}!`); this.carregar(); },
        error: () => this.alert.error(`Erro ao ${acao} espécie`),
      });
    });
  }
}
