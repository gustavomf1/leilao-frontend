import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardModule,
  ButtonDirective,
  GridModule,
  SpinnerComponent,
} from '@coreui/angular';
import { RelatorioService, CompradorResumo } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Leilao } from '../../../core/models/entities.model';

@Component({
  selector: 'app-fatura-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonDirective, GridModule, SpinnerComponent],
  templateUrl: './fatura-compra.component.html',
})
export class FaturaCompraComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private leilaoService = inject(LeilaoService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  leiloes: Leilao[] = [];
  compradores: CompradorResumo[] = [];
  selectedLeilaoId?: number;
  selectedCompradorId?: number;
  loading = false;

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
    this.selectedCompradorId = undefined;
    this.compradores = [];
    if (this.selectedLeilaoId) {
      this.relatorioService.getCompradoresDoLeilao(this.selectedLeilaoId).subscribe({
        next: (data) => {
          this.compradores = data;
          this.cdr.detectChanges();
        },
        error: () => this.alert.error('Erro ao carregar compradores do leilão'),
      });
    }
  }

  gerarFatura(): void {
    if (!this.selectedLeilaoId || !this.selectedCompradorId) return;
    this.loading = true;
    this.relatorioService
      .gerarFaturaCompra(this.selectedLeilaoId, this.selectedCompradorId)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.alert.error('Erro ao gerar fatura. Verifique se o comprador possui lotes neste leilão.');
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  get canGenerate(): boolean {
    return !!this.selectedLeilaoId && !!this.selectedCompradorId && !this.loading;
  }
}
