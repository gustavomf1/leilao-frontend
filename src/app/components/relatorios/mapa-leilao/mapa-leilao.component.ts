import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule, ButtonDirective, GridModule, SpinnerComponent } from '@coreui/angular';
import { finalize } from 'rxjs';
import { Leilao } from '../../../core/models/entities.model';
import { LeilaoService } from '../../../core/services/leilao.service';
import { RelatorioService } from '../../../core/services/relatorio.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-mapa-leilao',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonDirective, GridModule, SpinnerComponent],
  templateUrl: './mapa-leilao.component.html',
})
export class MapaLeilaoComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private leilaoService = inject(LeilaoService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  leiloes: Leilao[] = [];
  selectedLeilaoId?: number;
  loading = false;

  ngOnInit(): void {
    this.leilaoService.listar().subscribe({
      next: (data) => {
        this.leiloes = data;
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('Erro ao carregar leiloes'),
    });
  }

  gerarMapa(): void {
    if (!this.selectedLeilaoId) return;

    this.loading = true;
    this.relatorioService
      .gerarMapaLeilao(this.selectedLeilaoId)
      .pipe(finalize(() => this.finalizarLoading()))
      .subscribe({
        next: (blob) => this.abrirPdf(blob),
        error: () => this.alert.error('Erro ao gerar mapa. Verifique se ha lotes neste leilao.'),
      });
  }

  get canGenerate(): boolean {
    return !!this.selectedLeilaoId && !this.loading;
  }

  private abrirPdf(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  private finalizarLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
