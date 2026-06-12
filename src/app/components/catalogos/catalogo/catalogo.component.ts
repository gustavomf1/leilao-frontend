import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormModule,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBook, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../../core/services/leilao.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Leilao } from '../../../core/models/entities.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ColComponent,
    FormModule,
    RowComponent,
    SpinnerComponent,
    FontAwesomeModule,
  ],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent implements OnInit {
  private catalogoService = inject(CatalogoService);
  private leilaoService = inject(LeilaoService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  faBook = faBook;
  faFilePdf = faFilePdf;

  leiloes: Leilao[] = [];
  selectedLeilaoId?: number;
  loading = false;
  loadingCatalogo: number | null = null;

  ngOnInit(): void {
    this.leilaoService.listar().subscribe({
      next: (data) => { this.leiloes = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar leilões'),
    });
  }

  gerarCatalogo(tipo: number) {
    if (!this.selectedLeilaoId) return;
    this.loading = true;
    this.loadingCatalogo = tipo;

    this.catalogoService
      .gerarCatalogo(tipo, this.selectedLeilaoId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingCatalogo = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob: Blob) => {

          const url = window.URL.createObjectURL(blob);
          window.open(url);
        },

        error: (err) => {

          console.error(err);
          this.alert.error('Erro ao gerar catálogo');
        }
      });
  }

  onLeilaoChange(): void {
    this.loadingCatalogo = null;
  }

  get canGenerate(): boolean {
    return !!this.selectedLeilaoId && !this.loading;
  }
}
