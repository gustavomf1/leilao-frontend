import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Raca } from '../../../core/models/entities.model';
import { RacaService } from '../../../core/services/raca.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-raca-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
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

  racas$ = new BehaviorSubject<Raca[]>([]);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listarTodas().subscribe({
      next: (data) => this.racas$.next(data),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar racas'),
    });
  }

  toggleInativo(raca: Raca) {
    const acao = raca.inativo === 'S' ? 'ativar' : 'inativar';
    this.alert.confirm(`Deseja ${acao} a raca "${raca.nome}"?`, () => {
      this.service.inativar(raca.id!).subscribe({
        next: () => { this.alert.success(`Raca ${acao === 'ativar' ? 'ativada' : 'inativada'}!`); this.carregar(); },
        error: (err) => this.alert.error(err.error?.mensagem || `Erro ao ${acao} raca`),
      });
    });
  }
}
