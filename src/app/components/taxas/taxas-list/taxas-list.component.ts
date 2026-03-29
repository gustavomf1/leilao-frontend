import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Taxas } from '../../../core/models/entities.model';
import { TaxasService } from '../../../core/services/taxas.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-taxas-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './taxas-list.component.html'
})
export class TaxasListComponent implements OnInit {
  private service = inject(TaxasService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  taxas$ = new BehaviorSubject<Taxas[]>([]);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.taxas$.next(data)),
      error: () => this.alert.error('Erro ao carregar taxas')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir esta taxa?', () => {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Taxa excluída!'); this.carregar(); },
        error: () => this.alert.error('Erro ao excluir taxa')
      });
    });
  }
}