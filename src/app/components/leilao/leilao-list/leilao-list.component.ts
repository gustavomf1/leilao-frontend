import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { Leilao } from '../../../core/models/entities.model';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-leiloes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TableDirective, ButtonDirective, CardBodyComponent, CardComponent, FontAwesomeModule],
  templateUrl: './leilao-list.component.html'
})
export class LeiloesListComponent implements OnInit {
  private service = inject(LeilaoService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faEye = faEye;

  leiloes: Leilao[] = [];
  public leiloes$ = new Subject<Leilao[]>();

  ngOnInit() {
    this.carregar();
    this.cdr.detectChanges();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => {
        this.leiloes = data;
        this.leiloes$.next(this.leiloes);
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar leilões')
    });
  }

  deletar(id: number) {
    if (confirm('Deseja realmente excluir este leilão?')) {
      this.service.deletar(id).subscribe({
        next: () => { this.alert.success('Leilão excluído!'); this.carregar(); },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir leilão')
      });
    }
  }
}
