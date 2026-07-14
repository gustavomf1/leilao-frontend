import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Params, RouterModule } from '@angular/router';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { LoteService } from '../../../core/services/lote.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { LoteFotoService, LoteFoto } from '../../../core/services/lote-foto.service';
import { LoteFotosGaleriaComponent } from '../lote-fotos-galeria/lote-fotos-galeria.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CardModule, BadgeModule, SpinnerModule, GridModule, ButtonDirective, FormModule, ModalModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircle, faLayerGroup, faHashtag, faTag,
  faPaw, faDollarSign, faUser, faHorse,
  faPlus, faPencil, faArrowRight, faTrash, faCheck, faEye, faTimes, faShare, faFileInvoice,
  faPaperPlane, faSpinner, faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import { Lote, StatusLote, STATUS_LOTE_LABELS, STATUS_LOTE_COLOR, FaturaEnvioLog } from '../../../core/models/entities.model';

@Component({
  selector: 'app-monitor-lotes',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, FormsModule, CardModule, BadgeModule, SpinnerModule, GridModule, ButtonDirective, FormModule, ModalModule, FontAwesomeModule, LoteFotosGaleriaComponent],
  templateUrl: './monitor-lotes.component.html',
  styleUrl: './monitor-lotes.component.css'
})
export class MonitorLotesComponent implements OnInit, OnDestroy {
  // null = carregando, [] ou [...] = carregado
  lotes$ = new BehaviorSubject<Lote[] | null>(null);

  @Input() leilaoId?: number | null;
  @Input() tituloPagina = 'Lotes';
  @Input() tituloMonitor = 'Monitor de Lotes em Tempo Real';
  @Input() exibirContainer = true;
  @Input() exibirTituloPagina = true;
  @Input() exibirBotaoNovo = true;
  @Input() novoLoteQueryParams: Params | null = null;
  @Output() lotesChange = new EventEmitter<Lote[]>();

  @Input() exibirBotaoEnviarFatura: boolean = false;
  @Input() faturasLog: Record<string, FaturaEnvioLog> = {};
  @Output() enviarFaturaLote = new EventEmitter<{ lote: Lote; destino: 'VENDEDOR' | 'COMPRADOR' | 'AMBOS' }>();

  @Input() set lotesIniciais(value: Lote[] | null | undefined) {
    if (value === undefined) return;
    this.carregadoPorInput = true;
    const lotes = value ?? [];
    const atuais = this.lotes$.value;
    this.publicarLotes(atuais ? this.mesclarLotes(atuais, lotes) : lotes, false);
  }

  filtroStatus: StatusLote | 'TODOS' | 'NAO_VENDIDO' = 'TODOS';
  precoInput: Record<number, number | null> = {};

  readonly STATUS_LABELS = STATUS_LOTE_LABELS;
  readonly STATUS_COLOR  = STATUS_LOTE_COLOR;

  readonly statusOpcoes: Array<{ value: StatusLote | 'TODOS' | 'NAO_VENDIDO'; label: string }> = [
    { value: 'TODOS',                    label: 'Todos'                       },
    { value: 'AGUARDANDO_ESCRITORIO',    label: 'Aguardando Escritório'       },
    { value: 'AGUARDANDO_LANCE',         label: 'Aguardando Lance'            },
    { value: 'AGUARDANDO_ULTIMA_VALIDACAO', label: 'Aguardando Ult. Validação' },
    { value: 'FINALIZADO',               label: 'Finalizado'                  },
    { value: 'NAO_VENDIDO',              label: 'Não Vendido'                 },
  ];

  readonly faCircle     = faCircle;
  readonly faLayerGroup = faLayerGroup;
  readonly faHashtag    = faHashtag;
  readonly faTag        = faTag;
  readonly faPaw        = faPaw;
  readonly faDollarSign = faDollarSign;
  readonly faUser       = faUser;
  readonly faHorse      = faHorse;
  readonly faPlus       = faPlus;
  readonly faPencil     = faPencil;
  readonly faArrowRight = faArrowRight;
  readonly faTrash      = faTrash;
  readonly faCheck      = faCheck;
  readonly faEye        = faEye;
  readonly faTimes      = faTimes;
  readonly faShare       = faShare;
  readonly faFileInvoice = faFileInvoice;
  readonly faPaperPlane  = faPaperPlane;
  readonly faSpinner     = faSpinner;
  readonly faCheckDouble = faCheckDouble;

  dropdownFaturaAberto: Record<number, boolean> = {};

  logFatura(lote: Lote, tipo: 'COMPRA' | 'VENDA'): FaturaEnvioLog | undefined {
    if (!lote.id) return undefined;
    return this.faturasLog[`${lote.id}-${tipo}`];
  }

  statusFatura(lote: Lote): 'SEM_LOG' | 'ENVIANDO' | 'ENVIADO' | 'ENTREGUE' | 'FALHA' {
    const compra = this.logFatura(lote, 'COMPRA')?.status;
    const venda  = this.logFatura(lote, 'VENDA')?.status;
    const piorIndex = (s?: string) => {
      const ordem = ['FALHA', 'ENVIANDO', 'ENVIADO', 'ENTREGUE'];
      return s ? ordem.indexOf(s) : -1;
    };
    const ia = piorIndex(compra);
    const ib = piorIndex(venda);
    if (ia === -1 && ib === -1) return 'SEM_LOG';
    const pior = ia <= ib ? compra : venda;
    return (pior as any) ?? 'SEM_LOG';
  }

  corBotaoFatura(lote: Lote): string {
    const s = this.statusFatura(lote);
    if (s === 'ENTREGUE') return 'success';
    if (s === 'ENVIADO')  return 'info';
    if (s === 'FALHA')    return 'danger';
    return 'primary';
  }

  toggleDropdownFatura(loteId: number) {
    this.dropdownFaturaAberto[loteId] = !this.dropdownFaturaAberto[loteId];
  }

  emitirEnviarFatura(lote: Lote, destino: 'VENDEDOR' | 'COMPRADOR' | 'AMBOS') {
    this.dropdownFaturaAberto[lote.id!] = false;
    this.enviarFaturaLote.emit({ lote, destino });
  }

  loteDetalhes: any | null = null;
  modalDetalhesVisivel = false;
  galeriaFotos: LoteFoto[] = [];

  modalTransferirVisivel = false;
  loteParaTransferir: Lote | null = null;
  leilaoSelecionadoId: number | null = null;
  leiloesDisponiveis: any[] = [];

  private wsService     = inject(LoteWebsocketService);
  private loteService   = inject(LoteService);
  private leilaoService = inject(LeilaoService);
  private alert         = inject(AlertService);
  private zone          = inject(NgZone);
  private loteFotoService = inject(LoteFotoService);
  auth                  = inject(AuthService);
  private carregadoPorInput = false;
  private wsSubscription?: Subscription;

  get lotesFiltrados(): Lote[] {
    const lotes = this.lotesDoContexto;
    if (this.filtroStatus === 'TODOS') return lotes;
    if (this.filtroStatus === 'NAO_VENDIDO') return lotes.filter(l => l.naoVendidoNoLeilao === 'S');
    return lotes.filter(l => l.status === this.filtroStatus);
  }

  get novoLoteParams(): Params | null {
    if (this.novoLoteQueryParams) return this.novoLoteQueryParams;
    if (this.leilaoId == null) return null;
    return { leilaoId: this.leilaoId, origemLeilaoId: this.leilaoId };
  }

  get contextoQueryParams(): Params | null {
    if (this.leilaoId == null) return null;
    return { origemLeilaoId: this.leilaoId };
  }

  ngOnInit(): void {
    if (!this.carregadoPorInput || this.leilaoId != null) {
      this.carregarLotesDaApi();
    }

    this.wsSubscription = this.wsService.novoLoteSubject.subscribe((novoLote: Lote) => {
      this.zone.run(() => {
        const atual = this.lotes$.value ?? [];
        const idx   = atual.findIndex(l => l.id === novoLote.id);
        if (idx >= 0) {
          const atualizado = [...atual];
          atualizado[idx]  = { ...atualizado[idx], ...novoLote };
          this.publicarLotes(atualizado);
        } else if (this.pertenceAoLeilao(novoLote)) {
          this.publicarLotes([novoLote, ...atual]);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  setFiltro(status: StatusLote | 'TODOS' | 'NAO_VENDIDO') {
    this.filtroStatus = status;
  }

  contadorPorStatus(status: StatusLote | 'TODOS' | 'NAO_VENDIDO'): number {
    const lotes = this.lotesDoContexto;
    if (status === 'TODOS') return lotes.length;
    if (status === 'NAO_VENDIDO') return lotes.filter(l => l.naoVendidoNoLeilao === 'S').length;
    return lotes.filter(l => l.status === status).length;
  }

  statusLabel(status: any): string {
    return this.STATUS_LABELS[status as StatusLote] ?? status ?? '';
  }

  statusColor(status: any): string {
    return this.STATUS_COLOR[status as StatusLote] ?? 'secondary';
  }

  validacaoQueryParams(validar: 'lance' | 'escritorio' | 'final'): Params {
    return this.leilaoId == null
      ? { validar }
      : { validar, origemLeilaoId: this.leilaoId };
  }

  abrirDetalhes(lote: Lote) {
    this.loteDetalhes = lote;
    this.modalDetalhesVisivel = true;
    this.galeriaFotos = [];
    if (lote.id != null) {
      this.loteFotoService.listar(lote.id).subscribe({
        next: (fotos) => this.galeriaFotos = fotos,
        error: () => {}
      });
    }
  }

  fecharDetalhes() {
    this.modalDetalhesVisivel = false;
    this.loteDetalhes = null;
    this.galeriaFotos = [];
  }

  abrirModalTransferir(lote: Lote) {
    this.loteParaTransferir = lote;
    this.leilaoSelecionadoId = null;
    this.leiloesDisponiveis = [];
    this.modalTransferirVisivel = true;
    this.leilaoService.listar().subscribe({
      next: (leiloes: any[]) => {
        this.leiloesDisponiveis = leiloes.filter(
          l => l.status === 'ABERTO' || l.status === 'EM_ANDAMENTO'
        );
      },
      error: () => this.alert.error('Erro ao carregar leilões disponíveis')
    });
  }

  fecharModalTransferir() {
    this.modalTransferirVisivel = false;
    this.loteParaTransferir = null;
    this.leilaoSelecionadoId = null;
  }

  confirmarTransferir() {
    if (!this.loteParaTransferir?.id || !this.leilaoSelecionadoId) return;
    this.loteService.transferirLote(this.loteParaTransferir.id, this.leilaoSelecionadoId).subscribe({
      next: (loteAtualizado) => {
        this._substituir(loteAtualizado);
        this.alert.success('Lote enviado para o próximo leilão!');
        this.fecharModalTransferir();
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao transferir lote')
    });
  }

  gerarNotaLeilao(lote: Lote) {
    if (!lote.id) {
      this.alert.error('Lote inválido');
      return;
    }

    this.loteService.gerarNotaLeilao(lote.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao gerar nota de leilão')
    });
  }

  confirmarPreco(id?: number) {
    if (id == null) {
      this.alert.error('Lote inválido');
      return;
    }
    const preco = this.precoInput[id];
    if (!preco || preco <= 0) {
      this.alert.error('Informe um preço válido');
      return;
    }
    this.loteService.registrarPreco(id, preco).subscribe({
      next: (loteAtualizado) => {
        this._substituir(loteAtualizado);
        delete this.precoInput[id];
        this.alert.success('Valor do lance registrado! Lote finalizado.');
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao registrar preço')
    });
  }

  avancarStatus(id?: number) {
    if (id == null) {
      this.alert.error('Lote inválido');
      return;
    }
    this.loteService.avancarStatus(id).subscribe({
      next: (loteAtualizado) => {
        this._substituir(loteAtualizado);
        this.alert.success(`Status: ${this.STATUS_LABELS[loteAtualizado.status!]}`);
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao avançar status')
    });
  }

  deletar(id?: number) {
    if (id == null) {
      this.alert.error('Lote inválido');
      return;
    }
    this.alert.confirm('Deseja realmente excluir este lote?', () => {
      this.loteService.deletar(id).subscribe({
        next: () => {
          this.publicarLotes((this.lotes$.value ?? []).filter(l => l.id !== id));
          this.alert.success('Lote excluído!');
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir lote')
      });
    });
  }

  private _substituir(lote: any) {
    const atual = this.lotes$.value ?? [];
    const idx   = atual.findIndex(l => l.id === lote.id);
    if (idx >= 0) {
      const novo  = [...atual];
      novo[idx]   = { ...novo[idx], ...lote };
      this.publicarLotes(novo);
    }
  }

  private get lotesDoContexto(): Lote[] {
    return (this.lotes$.value ?? []).filter(lote => this.pertenceAoLeilao(lote));
  }

  private pertenceAoLeilao(lote: Lote): boolean {
    if (this.leilaoId == null) return true;
    if (lote.leilaoId == null) return false;
    return Number(lote.leilaoId) === Number(this.leilaoId);
  }

  private carregarLotesDaApi(): void {
    this.loteService.listar().subscribe({
      next: (dados) => this.publicarLotes(dados),
      error: () => {
        if (this.lotes$.value === null) {
          this.publicarLotes([]);
        }
      }
    });
  }

  private mesclarLotes(atuais: Lote[], recebidos: Lote[]): Lote[] {
    const recebidosPorId = new Map(
      recebidos
        .filter(lote => lote.id != null)
        .map(lote => [lote.id, lote] as const)
    );

    const idsAtuais = new Set(atuais.map(lote => lote.id).filter((id): id is number => id != null));
    const atualizados = atuais.map(lote => {
      if (lote.id == null) return lote;
      const recebido = recebidosPorId.get(lote.id);
      return recebido ? { ...lote, ...recebido } : lote;
    });
    const novos = recebidos.filter(lote => lote.id == null || !idsAtuais.has(lote.id));

    return [...atualizados, ...novos];
  }

  private publicarLotes(lotes: Lote[], emitir = true): void {
    this.lotes$.next(lotes);
    if (emitir) {
      this.lotesChange.emit(this.lotesDoContexto);
    }
  }
}
