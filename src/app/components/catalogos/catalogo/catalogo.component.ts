import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule, ButtonDirective, GridModule, SpinnerComponent, } from '@coreui/angular';
import { RelatorioService, VendedorResumo } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Leilao } from '../../../core/models/entities.model';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonDirective, GridModule, SpinnerComponent],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent implements OnInit {

  private catalogoService = inject(CatalogoService);
  private relatorioService = inject(RelatorioService);
  private leilaoService = inject(LeilaoService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  leiloes: Leilao[] = [];
  vendedores: VendedorResumo[] = [];
  selectedLeilaoId?: number;
  selectedVendedorId?: number;
  loading = false;
  loadingCatalogo: number | null = null;
  http: any;

  ngOnInit(): void {
    this.leilaoService.listar().subscribe({
      next: (data) => {
        this.leiloes = data;
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('Erro ao carregar leilões'),
    });
  }

  onLeilaoChange(): void {
    this.selectedVendedorId = undefined;
    this.vendedores = [];
    if (this.selectedLeilaoId) {
      this.relatorioService.getVendedoresDoLeilao(this.selectedLeilaoId).subscribe({
        next: (data) => {
          this.vendedores = data;
          this.cdr.detectChanges();
        },
        error: () => this.alert.error('Erro ao carregar vendedores do leilão'),
      });
    }
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

  get canGenerate(): boolean {
    return !!this.selectedLeilaoId && !this.loading;
  }
}
