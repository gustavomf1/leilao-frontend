import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGavel, faHashtag, faPaw, faDollarSign,
  faUser, faCheck, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { Lote } from '../../../core/models/entities.model';

type LanceConfirmacao = {
  lote: Lote;
  preco: number;
  compradorNome: string;
};

@Component({
  selector: 'app-evento-publico',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, FontAwesomeModule],
  templateUrl: './evento-publico.component.html',
  styleUrl: './evento-publico.component.css'
})
export class EventoPublicoComponent implements OnInit, OnDestroy {
  private route        = inject(ActivatedRoute);
  private loteService  = inject(LoteService);
  private wsService    = inject(LoteWebsocketService);
  private zone         = inject(NgZone);
  private cdr          = inject(ChangeDetectorRef);

  leilaoId!: number;
  lotes$ = new BehaviorSubject<Lote[]>([]);
  loading = true;
  precoInput: Record<number, string> = {};
  compradorNomeInput: Record<number, string> = {};
  erro: string | null = null;
  sucesso: string | null = null;
  lancePendente: LanceConfirmacao | null = null;
  confirmacaoAberta = false;
  sucessoModalAberto = false;
  enviandoLance = false;

  readonly faGavel      = faGavel;
  readonly faHashtag    = faHashtag;
  readonly faPaw        = faPaw;
  readonly faDollarSign = faDollarSign;
  readonly faUser       = faUser;
  readonly faCheck      = faCheck;
  readonly faLayerGroup = faLayerGroup;

  get lotesFiltrados(): Lote[] {
    return this.lotes$.value.filter(l => l.status === 'AGUARDANDO_LANCE');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('leilaoId');
    if (!id) { return; }
    this.leilaoId = +id;

    this.loteService.listarPorLeilaoPublico(this.leilaoId).subscribe({
      next: (dados) => {
        this.zone.run(() => {
          this.lotes$.next(dados);
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.mostrarErro(`Erro ao carregar lotes (${err?.status ?? 'sem resposta'}): ${err?.error?.mensagem || err?.message || 'verifique o backend'}`);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });

    this.wsService.conectar();
    this.wsService.novoLoteSubject.subscribe((novoLote: Lote) => {
      this.zone.run(() => {
        if (novoLote.leilaoId !== this.leilaoId) return;

        this.sincronizarFilaDeLances(novoLote);
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy() {
    this.wsService.desconectar();
  }

  abrirConfirmacaoLance(lote: Lote) {
    if (!lote.id) return;
    const preco = this.normalizarValorLance(this.precoInput[lote.id]);
    if (!preco) {
      this.mostrarErro('Informe um valor válido para o lance.');
      return;
    }

    this.lancePendente = {
      lote,
      preco,
      compradorNome: (this.compradorNomeInput[lote.id] || '').trim()
    };
    this.confirmacaoAberta = true;
  }

  cancelarConfirmacao() {
    if (this.enviandoLance) return;
    this.confirmacaoAberta = false;
    this.lancePendente = null;
  }

  confirmarEnvioLance() {
    const loteId = this.lancePendente?.lote.id;
    if (!loteId || this.enviandoLance || !this.lancePendente) return;

    const { lote, preco, compradorNome } = this.lancePendente;
    this.enviandoLance = true;
    this.cdr.detectChanges();

    this.loteService.registrarPrecoPublico(loteId, preco, compradorNome).subscribe({
      next: (loteAtualizado) => {
        this.zone.run(() => {
          delete this.precoInput[lote.id!];
          delete this.compradorNomeInput[lote.id!];
          this.removerLoteDaFila(loteId);
          this.enviandoLance = false;
          this.confirmacaoAberta = false;
          this.sucessoModalAberto = true;
          this.mostrarSucesso(`Lance de ${this.formatarMoeda(preco)} registrado para o lote ${lote.codigo}!`);
          this.cdr.detectChanges();
          setTimeout(() => {
            this.sucessoModalAberto = false;
            this.lancePendente = null;
            this.cdr.detectChanges();
          }, 2200);
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.enviandoLance = false;
          this.confirmacaoAberta = false;
          this.mostrarErro(err.error?.mensagem || 'Erro ao registrar lance. Tente novamente.');
          this.cdr.detectChanges();
        });
      }
    });
  }

  private mostrarErro(msg: string) {
    this.erro = msg;
    setTimeout(() => this.erro = null, 4000);
  }

  private mostrarSucesso(msg: string) {
    this.sucesso = msg;
    setTimeout(() => this.sucesso = null, 4000);
  }

  private sincronizarFilaDeLances(loteAtualizado: Lote) {
    if (!loteAtualizado.id) return;

    const atual = this.lotes$.value;
    const idx = atual.findIndex(l => l.id === loteAtualizado.id);

    if (loteAtualizado.status !== 'AGUARDANDO_LANCE') {
      this.removerLoteDaFila(loteAtualizado.id);
      return;
    }

    if (idx >= 0) {
      const atualizado = [...atual];
      atualizado[idx] = loteAtualizado;
      this.lotes$.next(atualizado);
    } else {
      this.lotes$.next([...atual, loteAtualizado]);
    }
  }

  private removerLoteDaFila(loteId: number) {
    this.lotes$.next(this.lotes$.value.filter(l => l.id !== loteId));
  }

  private normalizarValorLance(valor: string | null | undefined): number | null {
    const texto = (valor ?? '').trim();
    if (!texto) return null;

    const valorLimpo = texto.replace(/[^\d,.-]/g, '');
    const valorNormalizado = valorLimpo.includes(',')
      ? valorLimpo.replace(/\./g, '').replace(',', '.')
      : valorLimpo.replace(/,/g, '');
    const preco = Number(valorNormalizado);

    return Number.isFinite(preco) && preco > 0 ? preco : null;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
}
