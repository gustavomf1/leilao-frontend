import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule, ButtonDirective, GridModule, SpinnerComponent } from '@coreui/angular';
import { finalize } from 'rxjs';
import { Leilao } from '../../../core/models/entities.model';
import { LeilaoService } from '../../../core/services/leilao.service';
import {
  CompradorResumo,
  RelatorioService,
  VendedorResumo,
} from '../../../core/services/relatorio.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-liberacao',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonDirective, GridModule, SpinnerComponent],
  templateUrl: './liberacao.component.html',
})
export class LiberacaoComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private leilaoService = inject(LeilaoService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  leiloes: Leilao[] = [];
  vendedores: VendedorResumo[] = [];
  compradores: CompradorResumo[] = [];
  selectedLeilaoId?: number;
  selectedVendedorId?: number;
  selectedCompradorId?: number;
  loading: 'retorno' | 'compra' | null = null;

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
    this.selectedCompradorId = undefined;
    this.vendedores = [];
    this.compradores = [];

    if (!this.selectedLeilaoId) return;

    this.relatorioService.getVendedoresDoLeilao(this.selectedLeilaoId).subscribe({
      next: (data) => {
        this.vendedores = data;
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('Erro ao carregar vendedores do leilão'),
    });

    this.relatorioService.getCompradoresDoLeilao(this.selectedLeilaoId).subscribe({
      next: (data) => {
        this.compradores = data;
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('Erro ao carregar compradores do leilão'),
    });
  }

  gerarRetorno(): void {
    if (!this.selectedLeilaoId || !this.selectedVendedorId) return;

    this.loading = 'retorno';
    this.relatorioService
      .gerarLiberacaoRetorno(this.selectedLeilaoId, this.selectedVendedorId)
      .pipe(finalize(() => this.finalizarLoading()))
      .subscribe({
        next: (blob) => this.abrirPdf(blob),
        error: () => this.alert.error('Erro ao gerar liberação de retorno. Verifique se há lotes não vendidos para este vendedor.'),
      });
  }

  gerarCompra(): void {
    if (!this.selectedLeilaoId || !this.selectedCompradorId) return;

    this.loading = 'compra';
    this.relatorioService
      .gerarLiberacaoCompra(this.selectedLeilaoId, this.selectedCompradorId)
      .pipe(finalize(() => this.finalizarLoading()))
      .subscribe({
        next: (blob) => this.abrirPdf(blob),
        error: () => this.alert.error('Erro ao gerar liberação de compra. Verifique se o comprador possui lotes neste leilão.'),
      });
  }

  get canGenerateRetorno(): boolean {
    return !!this.selectedLeilaoId && !!this.selectedVendedorId && !this.loading;
  }

  get canGenerateCompra(): boolean {
    return !!this.selectedLeilaoId && !!this.selectedCompradorId && !this.loading;
  }

  private abrirPdf(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private finalizarLoading(): void {
    this.loading = null;
    this.cdr.detectChanges();
  }
}
