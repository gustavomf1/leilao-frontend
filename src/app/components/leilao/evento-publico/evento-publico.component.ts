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

type FiltroEvento = 'TODOS' | 'AGUARDANDO_LANCE' | 'FINALIZADO';

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
  filtro: FiltroEvento = 'TODOS';
  precoInput: Record<number, number | null> = {};
  erro: string | null = null;
  sucesso: string | null = null;

  readonly filtros: Array<{ value: FiltroEvento; label: string }> = [
    { value: 'TODOS',            label: 'Todos'            },
    { value: 'AGUARDANDO_LANCE', label: 'Aguardando Lance' },
    { value: 'FINALIZADO',       label: 'Finalizado'       },
  ];

  readonly faGavel      = faGavel;
  readonly faHashtag    = faHashtag;
  readonly faPaw        = faPaw;
  readonly faDollarSign = faDollarSign;
  readonly faUser       = faUser;
  readonly faCheck      = faCheck;
  readonly faLayerGroup = faLayerGroup;

  get lotesFiltrados(): Lote[] {
    const lotes = this.lotes$.value;
    if (this.filtro === 'TODOS') return lotes;
    return lotes.filter(l => l.status === this.filtro);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('leilaoId');
    console.log('[EventoPublico] ngOnInit id:', id);
    if (!id) { console.warn('[EventoPublico] sem id na rota'); return; }
    this.leilaoId = +id;
    console.log('[EventoPublico] leilaoId:', this.leilaoId, 'service:', this.loteService);

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

        const atual = this.lotes$.value;
        const idx   = atual.findIndex(l => l.id === novoLote.id);
        const visivel = novoLote.status === 'AGUARDANDO_LANCE' || novoLote.status === 'FINALIZADO';

        if (idx >= 0) {
          if (visivel) {
            const atualizado = [...atual];
            atualizado[idx]  = novoLote;
            this.lotes$.next(atualizado);
          } else {
            this.lotes$.next(atual.filter(l => l.id !== novoLote.id));
          }
        } else if (visivel) {
          this.lotes$.next([...atual, novoLote]);
        }
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy() {
    this.wsService.desconectar();
  }

  confirmarLance(lote: Lote) {
    if (!lote.id) return;
    const preco = this.precoInput[lote.id];
    if (!preco || preco <= 0) {
      this.mostrarErro('Informe um valor válido para o lance.');
      return;
    }

    this.loteService.registrarPrecoPublico(lote.id, preco).subscribe({
      next: (loteAtualizado) => {
        delete this.precoInput[lote.id!];
        this.mostrarSucesso(`Lance de R$ ${preco.toFixed(2)} registrado para o lote ${lote.codigo}!`);
      },
      error: (err) => {
        this.mostrarErro(err.error?.mensagem || 'Erro ao registrar lance. Tente novamente.');
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
}
