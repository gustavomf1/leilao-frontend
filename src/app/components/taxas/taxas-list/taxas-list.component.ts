import { Component, OnInit, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableDirective, CardBodyComponent, CardComponent } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Taxas } from '../../../core/models/entities.model';
import { TaxasService } from '../../../core/services/taxas.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaxasDetailsComponent } from '../taxas-details/taxas-details.component';

@Component({
  selector: 'app-taxas-list',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterModule, TableModule, TableDirective,
    ButtonDirective, CardBodyComponent, CardComponent,
    FontAwesomeModule, TaxasDetailsComponent
  ],
  templateUrl: './taxas-list.component.html'
})
export class TaxasListComponent implements OnInit {
  private service = inject(TaxasService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  auth = inject(AuthService);

  faPlus = faPlus;
  faXmark = faXmark;

  taxas$ = new BehaviorSubject<Taxas[]>([]);

  // Drawer
  drawerAberto = false;

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.taxas$.next(data)),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar taxas')
    });
  }

  abrirDrawerNovo() {
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onTaxaSalva() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }
}
