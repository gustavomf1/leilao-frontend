import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardModule,
  ButtonDirective,
  GridModule,
  SpinnerComponent,
} from '@coreui/angular';
import { RelatorioService, VendedorResumo } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Leilao } from '../../../core/models/entities.model';

@Component({
  selector: 'app-fatura-venda',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonDirective, GridModule, SpinnerComponent],
  templateUrl: './fatura-venda.component.html',
})
export class FaturaVendaComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private leilaoService = inject(LeilaoService);
  private alert = inject(AlertService);

  leiloes: Leilao[] = [];
  vendedores: VendedorResumo[] = [];
  selectedLeilaoId?: number;
  selectedVendedorId?: number;
  loading = false;

  ngOnInit(): void {
    this.leilaoService.listar().subscribe({
      next: (data) => (this.leiloes = data),
      error: () => this.alert.error('Erro ao carregar leilões'),
    });
  }

  onLeilaoChange(): void {
    this.selectedVendedorId = undefined;
    this.vendedores = [];
    if (this.selectedLeilaoId) {
      this.relatorioService.getVendedoresDoLeilao(this.selectedLeilaoId).subscribe({
        next: (data) => (this.vendedores = data),
        error: () => this.alert.error('Erro ao carregar vendedores do leilão'),
      });
    }
  }

  gerarFatura(): void {
    if (!this.selectedLeilaoId || !this.selectedVendedorId) return;
    this.loading = true;
    this.relatorioService
      .gerarFaturaVenda(this.selectedLeilaoId, this.selectedVendedorId)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          this.loading = false;
        },
        error: () => {
          this.alert.error('Erro ao gerar fatura. Verifique se o vendedor possui lotes neste leilão.');
          this.loading = false;
        },
      });
  }

  get canGenerate(): boolean {
    return !!this.selectedLeilaoId && !!this.selectedVendedorId && !this.loading;
  }
}
