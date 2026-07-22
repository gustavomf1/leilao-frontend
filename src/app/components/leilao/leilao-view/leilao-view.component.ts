import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import {
  CardModule, BadgeComponent, ButtonDirective,
  GridModule, ModalModule
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faMapMarkerAlt, faCalendarAlt, faGavel,
  faHandshake, faDollarSign, faPaw, faInfoCircle,
  faPencil, faPlay, faStop, faLink, faPaperPlane, faFileInvoiceDollar,
  faFileCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../../core/services/leilao.service';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LeilaoDetalhes,
  Lote,
  StatusLeilao,
  STATUS_LEILAO_COLOR,
  STATUS_LEILAO_LABELS,
  FaturaEnvioLog
} from '../../../core/models/entities.model';
import { FaturaEnvioService } from '../../../core/services/fatura-envio.service';
import { MonitorLotesComponent } from '../../lote/lote-monitor/monitor-lotes.component';
import { CompradorResumo, RelatorioService, VendedorResumo } from '../../../core/services/relatorio.service';

interface LeilaoResumo {
  id: number;
  descricao: string;
  local: string;
  cidade: string;
  uf: string;
  data: string;
  condicao?: { descricao?: string };
  especie?: { nome?: string };
  taxaPadrao?: { taxa?: number; comissaoVenda?: number; comissaoCompra?: number; gta?: number };
  condicaoDescricao?: string;
  taxa?: number;
  comissaoVenda?: number;
  comissaoCompra?: number;
  gta?: number;
  especieNome?: string;
  tipoLeilao?: string;
  taxaPor?: string;
  status?: StatusLeilao;
  totalLotes: number;
  lotesVendidos: number;
  lotesRestantes: number;
  totalAnimais: number;
  animaisVendidos: number;
  movimentacaoBruta: number;
  receitaComissao: number;
  ticketMedio: number;
  lotes: Lote[];
}

@Component({
  selector: 'app-leilao-view',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    CardModule, BadgeComponent, ButtonDirective,
    GridModule, ModalModule,
    FontAwesomeModule,
    MonitorLotesComponent
  ],
  templateUrl: './leilao-view.component.html',
  styleUrl: './leilao-view.component.scss'
})
export class LeilaoViewComponent implements OnInit, OnDestroy {
  private service = inject(LeilaoService);
  private loteService = inject(LoteService);
  private wsService = inject(LoteWebsocketService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  faArrowLeft = faArrowLeft;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendarAlt = faCalendarAlt;
  faGavel = faGavel;
  faHandshake = faHandshake;
  faPercent = faDollarSign;
  faPaw = faPaw;
  faInfoCircle = faInfoCircle;
  faPencil = faPencil;
  faPlay = faPlay;
  faStop = faStop;
  faLink       = faLink;
  faPaperPlane = faPaperPlane;
  faFileInvoiceDollar = faFileInvoiceDollar;
  faFileCircleCheck = faFileCircleCheck;

  faturasLog: Record<string, FaturaEnvioLog> = {};
  private faturaEnvioService = inject(FaturaEnvioService);
  private relatorioService = inject(RelatorioService);

  faturasVisivel = false;
  dadosLeilaoVisivel = false;
  tipoFatura?: 'COMPRA' | 'VENDA';
  compradores: CompradorResumo[] = [];
  vendedores: VendedorResumo[] = [];
  carregandoPessoas = false;
  gerandoFatura?: string;
  gerandoLiberacao?: string;
  pessoasCarregadas = false;

  resumo?: LeilaoResumo;
  detalhes?: LeilaoDetalhes;
  loading$ = new BehaviorSubject<boolean>(true);
  leilaoId!: number;
  readonly statusLabels = STATUS_LEILAO_LABELS;
  readonly statusColors = STATUS_LEILAO_COLOR;

  private wsSubscription?: Subscription;

  get percentualVendido(): number {
    if (!this.resumo || this.resumo.totalLotes === 0) return 0;
    return Math.round((this.resumo.lotesVendidos / this.resumo.totalLotes) * 100);
  }

  get pesoTotal(): number {
    return this.resumo?.lotes.reduce((sum, l) => sum + (l.peso || 0), 0) ?? 0;
  }

  get especieNome(): string {
    return this.resumo?.especieNome || this.resumo?.especie?.nome || '—';
  }

  get condicaoDescricao(): string {
    return this.resumo?.condicaoDescricao || this.resumo?.condicao?.descricao || '—';
  }

  get taxaPorLabel(): string {
    if (!this.resumo?.taxaPor) return '—';
    return this.resumo.taxaPor === 'ANIMAL' ? 'Animal' : 'Lote';
  }

  get statusLeilao(): StatusLeilao | undefined {
    return this.resumo?.status ?? this.detalhes?.status;
  }

  get emAndamento(): boolean {
    return this.statusLeilao === 'EM_ANDAMENTO';
  }

  get isAberto(): boolean {
    return this.statusLeilao === 'ABERTO';
  }

  get isFinalizado(): boolean {
    return this.statusLeilao === 'FINALIZADO';
  }

  get podeGerenciarEvento(): boolean {
    return this.auth.hasPermission('LEILOES', 'EDITAR');
  }

  get lotesAguardandoLance(): Lote[] {
    return this.resumo?.lotes.filter(l => l.status === 'AGUARDANDO_LANCE') ?? [];
  }

  get lotesFinalizados(): Lote[] {
    return this.resumo?.lotes.filter(l => l.status === 'FINALIZADO') ?? [];
  }

  get totalAguardando(): number {
    return this.lotesAguardandoLance.length;
  }

  get totalFinalizados(): number {
    return this.lotesFinalizados.length;
  }

  get percentualLances(): number {
    const total = this.resumo?.totalLotes ?? 0;
    return total > 0 ? Math.round((this.totalFinalizados / total) * 100) : 0;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading$.next(false);
      return;
    }
    this.leilaoId = +id;
    this.carregarResumo();
    this.conectarWebsocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  carregarResumo(mostrarLoading = true): void {
    if (mostrarLoading) {
      this.loading$.next(true);
    }

    forkJoin({
      resumo: this.service.buscarResumo(this.leilaoId),
      detalhes: this.service.buscarDetalhes(this.leilaoId),
      lotes: this.loteService.listar(),
    }).subscribe({
      next: ({ resumo, detalhes, lotes }: { resumo: LeilaoResumo; detalhes: LeilaoDetalhes; lotes: Lote[] }) => {
        const lotesDoLeilao = this.filtrarLotesDoLeilao(lotes);
        this.detalhes = detalhes;
        this.resumo = this.normalizarResumo({
          ...resumo,
          status: detalhes.status,
          lotes: lotesDoLeilao.length > 0 ? lotesDoLeilao : resumo.lotes,
        });
        this.atualizarLotesDoMonitor(this.resumo.lotes);
        this.loading$.next(false);
        if (this.isFinalizado) {
          this.carregarPessoasDasFaturas();
          this.faturaEnvioService.buscarLogs(this.leilaoId).subscribe({
            next: (logs) => { this.faturasLog = logs; },
            error: () => {}
          });
        }
      },
      error: (err: any) => {
        this.alert.error(err.error?.mensagem || 'Erro ao carregar resumo do leilão');
        this.loading$.next(false);
      },
    });
  }

  enviarFaturasParaTodos(): void {
    const temAlgumEnviado = Object.values(this.faturasLog).some(
      l => l.status === 'ENVIADO' || l.status === 'ENTREGUE'
    );
    if (temAlgumEnviado) {
      this.alert.confirm(
        'Algumas faturas já foram enviadas. Deseja reenviar para todos ou apenas para quem ainda não recebeu?',
        () => this.executarEnvioGeral(false),
        'Reenviar todos',
        'warning'
      );
      this.alert.confirm(
        'Enviar somente para quem ainda não recebeu a fatura?',
        () => this.executarEnvioGeral(true),
        'Apenas novos',
        'primary'
      );
      return;
    }
    this.executarEnvioGeral(false);
  }

  abrirFaturas(): void {
    this.faturasVisivel = true;
    this.tipoFatura = undefined;
    this.carregarPessoasDasFaturas();
  }

  fecharFaturas(): void {
    this.faturasVisivel = false;
    this.tipoFatura = undefined;
  }

  selecionarTipoFatura(tipo: 'COMPRA' | 'VENDA', marcado: boolean): void {
    this.tipoFatura = marcado ? tipo : undefined;
    if (marcado) this.carregarPessoasDasFaturas();
  }

  private carregarPessoasDasFaturas(): void {
    if (this.pessoasCarregadas || this.carregandoPessoas) return;

    this.carregandoPessoas = true;
    forkJoin({
      compradores: this.relatorioService.getCompradoresDoLeilao(this.leilaoId),
      vendedores: this.relatorioService.getVendedoresDoLeilao(this.leilaoId)
    }).subscribe({
      next: ({ compradores, vendedores }) => {
        this.compradores = compradores;
        this.vendedores = vendedores;
        this.pessoasCarregadas = true;
        this.carregandoPessoas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoPessoas = false;
        this.cdr.detectChanges();
        this.alert.error('Erro ao carregar compradores e vendedores do leilão');
      }
    });
  }

  gerarFatura(tipo: 'COMPRA' | 'VENDA', pessoa: CompradorResumo | VendedorResumo): void {
    this.gerandoFatura = `${tipo}-${pessoa.id}`;
    const geracao = tipo === 'COMPRA'
      ? this.relatorioService.gerarFaturaCompra(this.leilaoId, pessoa.id)
      : this.relatorioService.gerarFaturaVenda(this.leilaoId, pessoa.id);

    geracao.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.gerandoFatura = undefined;
        this.cdr.detectChanges();
      },
      error: () => {
        this.gerandoFatura = undefined;
        this.cdr.detectChanges();
        this.alert.error(`Erro ao gerar a fatura de ${tipo === 'COMPRA' ? 'compra' : 'venda'} de ${pessoa.nome}.`);
      }
    });
  }

  gerarLiberacao(tipo: 'COMPRA' | 'VENDA', pessoa: CompradorResumo | VendedorResumo): void {
    this.gerandoLiberacao = `${tipo}-${pessoa.id}`;
    const geracao = tipo === 'COMPRA'
      ? this.relatorioService.gerarLiberacaoCompra(this.leilaoId, pessoa.id)
      : this.relatorioService.gerarLiberacaoRetorno(this.leilaoId, pessoa.id);

    geracao.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.gerandoLiberacao = undefined;
        this.cdr.detectChanges();
      },
      error: () => {
        this.gerandoLiberacao = undefined;
        this.cdr.detectChanges();
        this.alert.error(
          `Erro ao gerar a liberação de ${tipo === 'COMPRA' ? 'compra' : 'retorno'} de ${pessoa.nome}.`
        );
      }
    });
  }

  private executarEnvioGeral(apenasNaoEnviados: boolean): void {
    this.faturaEnvioService.enviarTodasFaturas(this.leilaoId, apenasNaoEnviados).subscribe({
      next: (res: any) => {
        this.alert.success(res?.message || 'Envio de faturas iniciado!');
        setTimeout(() => {
          this.faturaEnvioService.buscarLogs(this.leilaoId).subscribe({
            next: (logs) => { this.faturasLog = logs; },
            error: () => {}
          });
        }, 3000);
      },
      error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao iniciar envio de faturas')
    });
  }

  onEnviarFaturaLote(event: { lote: Lote; destino: 'VENDEDOR' | 'COMPRADOR' | 'AMBOS' }): void {
    const { lote, destino } = event;
    const chaveCompra = `${lote.id}-COMPRA`;
    const chaveVenda  = `${lote.id}-VENDA`;

    const jaEnviado = (chave: string) => {
      const s = this.faturasLog[chave]?.status;
      return s === 'ENVIADO' || s === 'ENTREGUE';
    };

    const precisaConfirmar =
      ((destino === 'COMPRADOR' || destino === 'AMBOS') && jaEnviado(chaveCompra)) ||
      ((destino === 'VENDEDOR'  || destino === 'AMBOS') && jaEnviado(chaveVenda));

    const executar = () => {
      const obs: any[] = [];
      if (destino === 'COMPRADOR' || destino === 'AMBOS') {
        obs.push(this.faturaEnvioService.enviarFaturaCompra(lote.id!));
      }
      if (destino === 'VENDEDOR' || destino === 'AMBOS') {
        obs.push(this.faturaEnvioService.enviarFaturaVenda(lote.id!));
      }
      forkJoin(obs).subscribe({
        next: () => {
          this.alert.success('Fatura enviada com sucesso!');
          this.faturaEnvioService.buscarLogs(this.leilaoId).subscribe({
            next: (logs) => { this.faturasLog = logs; },
            error: () => {}
          });
        },
        error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao enviar fatura')
      });
    };

    if (precisaConfirmar) {
      this.alert.confirm('Esta fatura já foi enviada. Deseja reenviar?', executar, 'Reenviar', 'warning');
    } else {
      executar();
    }
  }

  tipoLeilaoLabel(tipo?: string): string {
    const labels: Record<string, string> = {
      PRESENCIAL: 'Presencial', ONLINE: 'Online', HIBRIDO: 'Híbrido',
      ELITE: 'Elite', CORTE: 'Corte', LEITE: 'Leite',
      PRENHEZ: 'Prenhez', OUTROS: 'Outros', DOACAO: 'Doação'
    };
    return tipo ? labels[tipo] ?? tipo : '—';
  }

  atualizarLotesDoMonitor(lotes: Lote[]): void {
    if (!this.resumo) return;

    const lotesVendidos = lotes.filter(l => this.loteContaComoVendido(l));
    const lotesRestantes = lotes.filter(l => !this.loteContaComoVendido(l));
    const movimentacaoBruta = lotesVendidos.reduce(
      (sum, l) => sum + ((l.precoCompra || 0) * (l.qntdAnimais || 0)),
      0
    );

    this.resumo = {
      ...this.resumo,
      lotes,
      totalLotes: lotes.length,
      lotesVendidos: lotesVendidos.length,
      lotesRestantes: lotesRestantes.length,
      totalAnimais: lotes.reduce((sum, l) => sum + (l.qntdAnimais || 0), 0),
      animaisVendidos: lotesVendidos.reduce((sum, l) => sum + (l.qntdAnimais || 0), 0),
      movimentacaoBruta,
      ticketMedio: lotesVendidos.length > 0 ? movimentacaoBruta / lotesVendidos.length : 0,
    };
  }

  statusLabel(status?: StatusLeilao): string {
    return status ? this.statusLabels[status] : '—';
  }

  statusColor(status?: StatusLeilao): string {
    return status ? this.statusColors[status] : 'secondary';
  }

  iniciarLeilao(): void {
    this.alert.confirm('Deseja iniciar o evento do leilão? Os lotes serão abertos para lances.', () => {
      this.service.iniciarLeilao(this.leilaoId).subscribe({
        next: (leilao) => {
          this.detalhes = leilao;
          if (this.resumo) {
            this.resumo = { ...this.resumo, status: leilao.status };
          }
          this.alert.success('Leilão iniciado com sucesso!');
          this.carregarResumo(false);
        },
        error: (err: any) => {
          this.alert.error(err.error?.mensagem || err.error?.message || 'Erro ao iniciar leilão');
        },
      });
    }, 'Iniciar', 'success');
  }

  encerrarLeilao(): void {
    const msg = this.totalAguardando > 0
      ? `Ainda existem ${this.totalAguardando} lote(s) sem lance. Ao encerrar, serão marcados como "Não vendido no leilão". Deseja continuar?`
      : 'Todos os lotes foram arrematados. Deseja encerrar o leilão?';

    this.alert.confirm(msg, () => {
      this.service.encerrarLeilao(this.leilaoId).subscribe({
        next: (leilao) => {
          this.detalhes = leilao;
          if (this.resumo) {
            this.resumo = { ...this.resumo, status: leilao.status };
          }
          this.alert.success('Leilão encerrado com sucesso!');
          this.carregarResumo(false);
        },
        error: (err: any) => {
          this.alert.error(err.error?.mensagem || err.error?.message || 'Erro ao encerrar leilão');
        },
      });
    }, 'Encerrar', 'danger');
  }

  gerarLink(): void {
    const url = `${window.location.origin}/#/publico/evento/${this.leilaoId}`;
    navigator.clipboard.writeText(url)
      .then(() => this.alert.success('Link copiado para a área de transferência!'))
      .catch(() => this.alert.error('Não foi possível copiar o link.'));
  }

  private normalizarResumo(data: LeilaoResumo): LeilaoResumo {
    return {
      ...data,
      especieNome: data.especieNome || data.especie?.nome,
      condicaoDescricao: data.condicaoDescricao || data.condicao?.descricao,
      taxa: data.taxa ?? data.taxaPadrao?.taxa,
      comissaoVenda: data.comissaoVenda ?? data.taxaPadrao?.comissaoVenda,
      comissaoCompra: data.comissaoCompra ?? data.taxaPadrao?.comissaoCompra,
      gta: data.gta ?? data.taxaPadrao?.gta,
      lotes: data.lotes || [],
    };
  }

  private conectarWebsocket(): void {
    this.wsService.conectar();
    this.wsSubscription = this.wsService.novoLoteSubject.subscribe((lote: Lote) => {
      this.zone.run(() => {
        if (!this.lotePertenceAoLeilao(lote)) return;
        this.aplicarLoteAtualizado(lote);
      });
    });
  }

  private lotePertenceAoLeilao(lote: Lote): boolean {
    if (lote.leilaoId != null) {
      return Number(lote.leilaoId) === Number(this.leilaoId);
    }
    return this.resumo?.lotes.some(l => l.id === lote.id) ?? false;
  }

  private filtrarLotesDoLeilao(lotes: Lote[]): Lote[] {
    return lotes.filter(lote => Number(lote.leilaoId) === Number(this.leilaoId));
  }

  private aplicarLoteAtualizado(lote: Lote): void {
    if (!this.resumo) return;

    const atual = this.resumo.lotes;
    const idx = atual.findIndex(l => l.id === lote.id);
    const lotes = idx >= 0
      ? atual.map(l => l.id === lote.id ? { ...l, ...lote } : l)
      : [lote, ...atual];

    this.atualizarLotesDoMonitor(lotes);
  }

  private loteContaComoVendido(lote: Lote): boolean {
    return lote.naoVendidoNoLeilao !== 'S'
      && (lote.compradorId != null || lote.precoCompra != null || lote.status === 'FINALIZADO');
  }
}
