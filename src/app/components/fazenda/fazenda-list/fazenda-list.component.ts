import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Fazenda } from '../../../core/models/entities.model';
import { FazendaService } from '../../../core/services/fazenda.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-fazendas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './fazenda-list.component.html'
})
export class FazendasListComponent implements OnInit {
  private service = inject(FazendaService);
  private alert = inject(AlertService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  fazendas: Fazenda[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.fazendas = data,
      error: () => this.alert.error('Erro ao carregar fazendas')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir esta fazenda?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Fazenda excluída!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir fazenda')
      });
    }
  }
}
