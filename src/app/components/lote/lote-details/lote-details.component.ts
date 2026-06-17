import { Component, OnInit, inject, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule, GridModule,
  ModalModule, ModalComponent, DropdownModule
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faCheck, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { LoteService } from '../../../core/services/lote.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { EspecieService } from '../../../core/services/especie.service';
import { RacaService } from '../../../core/services/raca.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { PixService } from '../../../core/services/pix.service';
import { Especie, Raca, LeilaoDetalhes, Cliente, Pix } from '../../../core/models/entities.model';
import { LoteFotosComponent } from '../lote-fotos/lote-fotos.component';

@Component({
  selector: 'app-lotes-details',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    CardModule, ButtonDirective, FormModule, GridModule,
    ModalModule, DropdownModule, FontAwesomeModule, LoteFotosComponent
  ],
  templateUrl: './lote-details.component.html',
  styleUrl: './lote-details.component.css'
})
export class LotesDetailsComponent implements OnInit {
  private el = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private service = inject(LoteService);
  private alert = inject(AlertService);
  auth = inject(AuthService);
  private especieService = inject(EspecieService);
  private racaService = inject(RacaService);
  private leilaoService = inject(LeilaoService);
  private clienteService = inject(ClienteService);
  private pixService = inject(PixService);

  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faTimes = faTimes;
  faPlus = faPlus;

  form!: FormGroup;
  isEdicao = false;
  isValidacaoEscritorio = false;
  isValidacaoLance = false;
  isValidacaoFinal = false;
  modalVisible = false;
  private entityId?: number;
  origemLeilaoId?: number;

  especies: Especie[] = [];
  racas: Raca[] = [];
  leiloes: LeilaoDetalhes[] = [];
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  vendedorBusca = '';
  mostrarDropdownVendedor = false;
  vendedorSelecionado: Cliente | null = null;

  compradorBusca = '';
  mostrarDropdownComprador = false;
  compradorSelecionado: Cliente | null = null;
  compradorFiltrados: Cliente[] = [];

  loteCarregado: any = null;
  validacaoCompradorId: number | null = null;
  validacaoCompradorBusca = '';
  validacaoCompradorSelecionado: Cliente | null = null;
  validacaoCompradorFiltrados: Cliente[] = [];
  mostrarDropdownValidacaoComprador = false;
  validacaoComissaoVendedor: number | null = null;
  validacaoComissaoComprador: number | null = null;
  lancePrecoCompra: number | null = null;
  lanceComissaoVendedor: number | null = null;
  lanceComissaoComprador: number | null = null;
  recolocacaoComissaoVendedor: number | null = null;
  recolocacaoComissaoComprador: number | null = null;

  pixDoVendedor: Pix[] = [];
  pixCarregando = false;
  pixCarregado = false;
  modalNovoPixVisivel = false;
  novoPixTipo: '' | Pix['tipo'] = '';
  novoPixChave = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.mostrarDropdownVendedor = false;
      this.mostrarDropdownComprador = false;
      this.mostrarDropdownValidacaoComprador = false;
    }
  }

  get loteIdAtual(): number | undefined {
    return this.entityId;
  }

  get isManejoMode(): boolean {
    return this.auth.isManejo();
  }

  get isEscritorioMode(): boolean {
    return !this.auth.isManejo() && !this.auth.isAdmin();
  }

  get exibirFinanceiro(): boolean {
    return !this.isManejoMode && !this.isValidacaoEscritorio && !this.isValidacaoLance;
  }

  get tituloPagina(): string {
    if (this.isValidacaoEscritorio) return 'Validar Lote';
    if (this.isValidacaoLance) return 'Validar Lance';
    if (this.isValidacaoFinal) return 'Validar Final';
    return this.isEdicao ? 'Editar Lote' : 'Novo Lote';
  }

  get acaoPrincipalLabel(): string {
    if (this.isValidacaoEscritorio) return 'Validar Lote';
    return this.isEdicao ? 'Salvar Alterações' : 'Cadastrar Lote';
  }

  get podeEnviarParaValidacaoFinal(): boolean {
    return !!this.lancePrecoCompra && this.lancePrecoCompra > 0 && !!this.validacaoCompradorId;
  }

  // Dados formatados para exibir no modal de confirmação
  get resumoParaConfirmacao(): { label: string; valor: any }[] {
    const f = this.form.getRawValue();
    return [
      { label: 'Código', valor: f.codigo },
      { label: 'Qtd. Animais', valor: f.qntdAnimais },
      { label: 'Sexo', valor: f.sexo },
      { label: 'Espécie', valor: this.especies.find(e => e.id === f.especieId)?.nome ?? f.especieId },
      { label: 'Raça', valor: f.raca },
      { label: 'Categoria', valor: f.categoriaAnimal },
      { label: 'Idade (meses)', valor: f.idadeEmMeses },
      { label: 'Peso (kg)', valor: f.peso },
      { label: 'Vendedor', valor: f.vendedorNomeRascunho || '—' },
      { label: 'Leilão', valor: this.leiloes.find(l => l.id === f.leilaoId)?.descricao ?? f.leilaoId ?? '—' },
      { label: 'Observações', valor: f.obs || '—' },
    ].filter(i => i.valor !== null && i.valor !== undefined);
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const modoValidacao = this.route.snapshot.queryParamMap.get('validar');
    const leilaoIdParam = this.route.snapshot.queryParamMap.get('leilaoId');
    const origemLeilaoIdParam = this.route.snapshot.queryParamMap.get('origemLeilaoId');
    this.isValidacaoEscritorio = modoValidacao === 'escritorio';
    this.isValidacaoLance = modoValidacao === 'lance';
    this.isValidacaoFinal = modoValidacao === 'final';
    this.origemLeilaoId = origemLeilaoIdParam ? +origemLeilaoIdParam : undefined;

    this.form = this.fb.group({
      codigo: ['', Validators.required],
      qntdAnimais: [1, [Validators.required, Validators.min(1)]],
      sexo: ['', Validators.required],
      idadeEmMeses: [0, [Validators.required, Validators.min(0)]],
      peso: [0, [Validators.required, Validators.min(0)]],
      raca: ['', Validators.required],
      especieId: [null, Validators.required],
      categoriaAnimal: ['', Validators.required],
      obs: [''],
      leilaoId: [null],
      vendedorNomeRascunho: [''],
      vendedorId: [null],
      compradorId: [null],
      precoCompra: [null]
    });

    const atualizarCategoria = () => {
      const sexo = this.form.get('sexo')?.value;
      const idade = this.form.get('idadeEmMeses')?.value;
      const categoria = this.calcularCategoria(sexo, Number(idade));
      if (categoria) {
        this.form.get('categoriaAnimal')?.setValue(categoria, { emitEvent: false });
      }
    };

    this.form.get('sexo')?.valueChanges.subscribe(() => atualizarCategoria());
    this.form.get('idadeEmMeses')?.valueChanges.subscribe(() => atualizarCategoria());
    this.form.get('especieId')?.valueChanges.subscribe((especieId) => {
      this.carregarRacasPorEspecie(especieId);
      this.form.get('raca')?.setValue('');
    });

    if (leilaoIdParam) {
      this.form.get('leilaoId')?.setValue(+leilaoIdParam);
    }

    if (this.isManejoMode) {
      this.form.get('precoCompra')?.clearValidators();
      this.form.get('vendedorId')?.clearValidators();
      this.form.get('compradorId')?.clearValidators();
      this.form.get('precoCompra')?.updateValueAndValidity();
    }

    if (this.isValidacaoEscritorio) {
      this.form.get('vendedorId')?.setValidators([Validators.required]);
      this.form.get('vendedorId')?.updateValueAndValidity();
    }

    this.especieService.listar().subscribe({
      next: es => { this.especies = es; this.cdr.detectChanges(); }
    });
    this.leilaoService.listar().subscribe({
      next: (leiloes: any[]) => {
        this.leiloes = leiloes.filter((l: any) => l.status !== 'FINALIZADO');
        this.cdr.detectChanges();
      }
    });
    this.clienteService.listar().subscribe({
      next: clientes => {
        this.clientes = clientes;
        this.clientesFiltrados = clientes;
        this.compradorFiltrados = clientes;
        this.validacaoCompradorFiltrados = clientes;
        this.restaurarSelecoes();
        this.cdr.detectChanges();
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => {
          this.loteCarregado = data;
          this.form.patchValue(data, { emitEvent: false });
          if (data.especieId) {
            this.carregarRacasPorEspecie(data.especieId, data.raca);
          }
          this.restaurarSelecoes();
          this.carregarTaxaDoLeilao(data.leilaoId);
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar lote')
      });
    }
  }

  filtrarVendedor() {
    const termo = this.vendedorBusca.toLowerCase().trim();
    this.clientesFiltrados = termo
      ? this.clientes.filter(c => c.nome.toLowerCase().includes(termo))
      : this.clientes;
    this.mostrarDropdownVendedor = this.clientesFiltrados.length > 0;
    this.vendedorSelecionado = null;
    this.form.get('vendedorId')?.setValue(null);
    this.cdr.markForCheck();
  }

  selecionarVendedor(cliente: Cliente) {
    this.vendedorSelecionado = cliente;
    this.vendedorBusca = cliente.nome;
    this.form.get('vendedorId')?.setValue(cliente.id);
    this.mostrarDropdownVendedor = false;
    this.cdr.markForCheck();
  }

  fecharDropdownVendedor() {
    setTimeout(() => { this.mostrarDropdownVendedor = false; this.cdr.markForCheck(); }, 180);
  }

  abrirDropdownVendedor() {
    this.clientesFiltrados = this.vendedorBusca.trim()
      ? this.clientes.filter(c => c.nome.toLowerCase().includes(this.vendedorBusca.toLowerCase()))
      : this.clientes;
    this.mostrarDropdownVendedor = this.clientesFiltrados.length > 0;
    this.cdr.markForCheck();
  }

  filtrarComprador() {
    const termo = this.compradorBusca.toLowerCase().trim();
    this.compradorFiltrados = termo
      ? this.clientes.filter(c => c.nome.toLowerCase().includes(termo))
      : this.clientes;
    this.mostrarDropdownComprador = this.compradorFiltrados.length > 0;
    this.compradorSelecionado = null;
    this.form.get('compradorId')?.setValue(null);
    this.cdr.markForCheck();
  }

  selecionarComprador(cliente: Cliente) {
    this.compradorSelecionado = cliente;
    this.compradorBusca = cliente.nome;
    this.form.get('compradorId')?.setValue(cliente.id);
    this.mostrarDropdownComprador = false;
    this.cdr.markForCheck();
  }

  fecharDropdownComprador() {
    setTimeout(() => { this.mostrarDropdownComprador = false; this.cdr.markForCheck(); }, 180);
  }

  abrirDropdownComprador() {
    this.compradorFiltrados = this.compradorBusca.trim()
      ? this.clientes.filter(c => c.nome.toLowerCase().includes(this.compradorBusca.toLowerCase()))
      : this.clientes;
    this.mostrarDropdownComprador = this.compradorFiltrados.length > 0;
    this.cdr.markForCheck();
  }

  /** Manejo clica em Cadastrar → abre modal de confirmação */
  tentarSalvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Manejo e não-edição → pede confirmação
    if (this.isManejoMode && !this.isEdicao) {
      this.modalVisible = true;
      return;
    }
    this.executarSalvar();
  }

  confirmarModal() {
    this.modalVisible = false;
    this.executarSalvar();
  }

  cancelarModal() {
    this.modalVisible = false;
  }

  private executarSalvar() {
    const dados = this.form.getRawValue();
    if (this.isValidacaoEscritorio && !dados.vendedorId) {
      this.alert.error('Vincule o vendedor para validar o lote.');
      this.form.get('vendedorId')?.markAsTouched();
      return;
    }
    if (this.isManejoMode || this.isValidacaoEscritorio || this.isValidacaoLance) {
      delete dados.compradorId;
      delete dados.precoCompra;
    }
    const op = this.isEdicao
      ? this.service.atualizar(this.entityId!, dados)
      : this.service.salvar(dados);
    op.subscribe({
      next: () => {
        if (this.isValidacaoEscritorio && this.isEdicao) {
          this.service.avancarStatus(this.entityId!).subscribe({
            next: () => {
              this.alert.success('Lote validado e enviado para lance!');
              this.navegarRetorno();
            },
            error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao validar lote')
          });
          return;
        }
        this.alert.success(this.isEdicao ? 'Lote atualizado!' : 'Lote cadastrado e enviado para preenchimento de preço!');
        this.navegarRetorno();
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar lote')
    });
  }

  get isAguardandoUltimaValidacao(): boolean {
    if (this.loteCarregado?.status === 'AGUARDANDO_ULTIMA_VALIDACAO') return true;
    // Lotes não vendidos permanecem em AGUARDANDO_LANCE após encerramento do leilão
    if (this.isValidacaoFinal && this.loteCarregado?.naoVendidoNoLeilao === 'S') return true;
    return false;
  }

  get loteNaoVendido(): boolean {
    return this.loteCarregado?.naoVendidoNoLeilao === 'S';
  }

  get especieNome(): string {
    return this.especies.find(e => e.id === this.loteCarregado?.especieId)?.nome ?? '—';
  }

  filtrarValidacaoComprador() {
    const termo = this.validacaoCompradorBusca.toLowerCase().trim();
    this.validacaoCompradorFiltrados = termo
      ? this.clientes.filter(c => c.nome.toLowerCase().includes(termo))
      : this.clientes;
    this.mostrarDropdownValidacaoComprador = this.validacaoCompradorFiltrados.length > 0;
    this.validacaoCompradorSelecionado = null;
    this.validacaoCompradorId = null;
    this.cdr.markForCheck();
  }

  selecionarValidacaoComprador(cliente: Cliente) {
    this.validacaoCompradorSelecionado = cliente;
    this.validacaoCompradorBusca = cliente.nome;
    this.validacaoCompradorId = cliente.id!;
    this.mostrarDropdownValidacaoComprador = false;
    this.cdr.markForCheck();
  }

  fecharDropdownValidacaoComprador() {
    setTimeout(() => { this.mostrarDropdownValidacaoComprador = false; this.cdr.markForCheck(); }, 180);
  }

  confirmarValidacaoFinal() {
    if (!this.validacaoCompradorId) {
      this.alert.error('Selecione o comprador para validar o lote.');
      return;
    }
    this.service.validarFinal(this.entityId!, {
      compradorId: this.validacaoCompradorId,
      comissaoVenda: this.validacaoComissaoVendedor,
      comissaoCompra: this.validacaoComissaoComprador,
    }).subscribe({
      next: () => {
        this.alert.success('Lote finalizado com sucesso!');
        this.navegarRetorno();
      },
      error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao validar lote')
    });
  }

  carregarPixDoVendedor(): void {
    if (this.pixCarregado || this.loteCarregado?.vendedorId == null) return;
    this.pixCarregando = true;
    this.pixService.listarPorUsuario(this.loteCarregado.vendedorId).subscribe({
      next: (lista) => {
        this.pixDoVendedor = lista;
        this.pixCarregado = true;
        this.pixCarregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.pixCarregando = false;
        this.alert.error('Erro ao carregar PIX do vendedor');
      }
    });
  }

  selecionarPix(pix: Pix | null): void {
    if (this.entityId == null) return;
    this.service.definirPixVendedor(this.entityId, pix?.pixId ?? null).subscribe({
      next: (loteAtualizado) => {
        this.loteCarregado = { ...this.loteCarregado, ...loteAtualizado };
        this.alert.success(pix ? 'PIX anexado ao lote!' : 'PIX removido do lote.');
        this.cdr.markForCheck();
      },
      error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao definir PIX do lote')
    });
  }

  formatarPix(tipo?: string, chave?: string): string {
    if (!tipo || !chave) return 'Nenhum selecionado';
    const labels: Record<string, string> = {
      CPF_CNPJ: 'CPF/CNPJ',
      TELEFONE: 'Telefone',
      EMAIL: 'E-mail',
      CHAVE_ALEATORIA: 'Chave Aleatória'
    };
    return `${labels[tipo] ?? tipo}: ${chave}`;
  }

  abrirModalNovoPix(): void {
    this.novoPixTipo = '';
    this.novoPixChave = '';
    this.modalNovoPixVisivel = true;
  }

  fecharModalNovoPix(): void {
    this.modalNovoPixVisivel = false;
  }

  confirmarNovoPix(): void {
    if (!this.novoPixTipo || !this.novoPixChave.trim() || this.loteCarregado?.vendedorId == null) {
      this.alert.error('Informe o tipo e a chave do PIX.');
      return;
    }
    this.pixService.cadastrar({
      usuarioId: this.loteCarregado.vendedorId,
      tipo: this.novoPixTipo,
      chave: this.novoPixChave.trim()
    }).subscribe({
      next: (novoPix) => {
        this.pixDoVendedor = [...this.pixDoVendedor, novoPix];
        this.alert.success('PIX cadastrado!');
        this.fecharModalNovoPix();
      },
      error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao cadastrar PIX')
    });
  }

  confirmarRecolocacao() {
    const recolocar = () => {
      this.service.recolocarLance(this.entityId!, {
        comissaoVenda: this.recolocacaoComissaoVendedor,
        comissaoCompra: this.recolocacaoComissaoComprador,
      }).subscribe({
        next: () => {
          this.alert.success('Lote recolocado em lance!');
          this.navegarRetorno();
        },
        error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao recolocar lote')
      });
    };

    if (this.validacaoCompradorId) {
      const dados = { ...this.form.getRawValue(), compradorId: this.validacaoCompradorId };
      this.service.atualizar(this.entityId!, dados).subscribe({
        next: recolocar,
        error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao salvar comprador')
      });
    } else {
      recolocar();
    }
  }

  confirmarEnvioValidacaoFinal() {
    if (!this.podeEnviarParaValidacaoFinal) {
      this.alert.error('Informe o preço do lote e vincule o comprador oficial.');
      return;
    }

    const dadosAtualizacao = {
      ...this.form.getRawValue(),
      precoCompra: this.lancePrecoCompra,
      compradorId: this.validacaoCompradorId,
      comissaoVenda: this.lanceComissaoVendedor,
      comissaoCompra: this.lanceComissaoComprador,
    };

    this.service.atualizar(this.entityId!, dadosAtualizacao).subscribe({
      next: () => {
        this.service.registrarPreco(this.entityId!, this.lancePrecoCompra!, {
          compradorId: this.validacaoCompradorId,
          comissaoVenda: this.lanceComissaoVendedor,
          comissaoCompra: this.lanceComissaoComprador,
        }).subscribe({
          next: () => {
            this.alert.success('Lote enviado para validação final!');
            this.navegarRetorno();
          },
          error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao enviar para validação final')
        });
      },
      error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao salvar dados do lance')
    });
  }

  confirmarLoteNaoVendido() {
    const dadosAtualizacao = {
      ...this.form.getRawValue(),
      precoCompra: null,
      compradorId: null,
      status: 'AGUARDANDO_LANCE',
      comissaoVenda: this.lanceComissaoVendedor,
      comissaoCompra: this.lanceComissaoComprador,
      naoVendidoNoLeilao: 'S',
    };

    this.service.atualizar(this.entityId!, dadosAtualizacao).subscribe({
      next: () => {
        this.alert.success('Lote marcado como não vendido e mantido em lance!');
        this.navegarRetorno();
      },
      error: (err: any) => this.alert.error(err.error?.mensagem || 'Erro ao marcar lote como não vendido')
    });
  }

  get rotaRetorno(): Array<string | number> {
    return this.origemLeilaoId ? ['/leiloes', this.origemLeilaoId, 'view'] : ['/lotes/lista'];
  }

  private navegarRetorno(): void {
    this.router.navigate(this.rotaRetorno);
  }

  private restaurarSelecoes() {
    if (!this.loteCarregado || !this.clientes.length) return;

    if (this.loteCarregado.vendedorId) {
      const v = this.clientes.find(c => c.id === this.loteCarregado.vendedorId);
      if (v) {
        this.vendedorSelecionado = v;
        this.vendedorBusca = v.nome;
        this.form.get('vendedorId')?.setValue(v.id);
      }
    }

    if (this.loteCarregado.compradorId) {
      const c = this.clientes.find(c => c.id === this.loteCarregado.compradorId);
      if (c) {
        this.compradorSelecionado = c;
        this.compradorBusca = c.nome;
        this.form.get('compradorId')?.setValue(c.id);
        this.validacaoCompradorSelecionado = c;
        this.validacaoCompradorBusca = c.nome;
        this.validacaoCompradorId = c.id!;
      }
    }

    if (this.loteCarregado.comissaoVenda != null)
      this.validacaoComissaoVendedor = this.loteCarregado.comissaoVenda;
    if (this.loteCarregado.comissaoCompra != null)
      this.validacaoComissaoComprador = this.loteCarregado.comissaoCompra;

    if (this.loteCarregado.precoCompra != null)
      this.lancePrecoCompra = this.loteCarregado.precoCompra;
    if (this.loteCarregado.comissaoVenda != null)
      this.lanceComissaoVendedor = this.loteCarregado.comissaoVenda;
    if (this.loteCarregado.comissaoCompra != null)
      this.lanceComissaoComprador = this.loteCarregado.comissaoCompra;

    if (this.loteCarregado.comissaoVenda != null)
      this.recolocacaoComissaoVendedor = this.loteCarregado.comissaoVenda;
    if (this.loteCarregado.comissaoCompra != null)
      this.recolocacaoComissaoComprador = this.loteCarregado.comissaoCompra;

    this.cdr.markForCheck();
  }

  private carregarTaxaDoLeilao(leilaoId?: number | null) {
    if (!leilaoId) return;
    this.leilaoService.buscarResumo(leilaoId).subscribe({
      next: (resumo: any) => {
        const comissaoVendaPadrao = resumo?.comissaoVenda ?? resumo?.taxaPadrao?.comissaoVenda;
        const comissaoCompraPadrao = resumo?.comissaoCompra ?? resumo?.taxaPadrao?.comissaoCompra;
        if (this.validacaoComissaoVendedor == null && comissaoVendaPadrao != null)
          this.validacaoComissaoVendedor = comissaoVendaPadrao;
        if (this.validacaoComissaoComprador == null && comissaoCompraPadrao != null)
          this.validacaoComissaoComprador = comissaoCompraPadrao;
        if (this.lanceComissaoVendedor == null && comissaoVendaPadrao != null)
          this.lanceComissaoVendedor = comissaoVendaPadrao;
        if (this.lanceComissaoComprador == null && comissaoCompraPadrao != null)
          this.lanceComissaoComprador = comissaoCompraPadrao;
        if (this.recolocacaoComissaoVendedor == null && comissaoVendaPadrao != null)
          this.recolocacaoComissaoVendedor = comissaoVendaPadrao;
        if (this.recolocacaoComissaoComprador == null && comissaoCompraPadrao != null)
          this.recolocacaoComissaoComprador = comissaoCompraPadrao;
        this.cdr.markForCheck();
      }
    });
  }

  private carregarRacasPorEspecie(especieId?: number | null, racaAtual?: string | null) {
    if (!especieId) {
      this.racas = [];
      this.cdr.markForCheck();
      return;
    }

    this.racaService.listarPorEspecie(especieId).subscribe({
      next: (racas) => {
        this.racas = racas;
        if (racaAtual && !racas.some(r => r.nome === racaAtual)) {
          this.racas = [{ nome: racaAtual, especieId }, ...racas];
        }
        this.cdr.markForCheck();
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar racas')
    });
  }

  abrirDropdownValidacaoComprador() {
    this.validacaoCompradorFiltrados = this.validacaoCompradorBusca.trim()
      ? this.clientes.filter(c => c.nome.toLowerCase().includes(this.validacaoCompradorBusca.toLowerCase()))
      : this.clientes;
    this.mostrarDropdownValidacaoComprador = this.validacaoCompradorFiltrados.length > 0;
    this.cdr.markForCheck();
  }

  private calcularCategoria(sexo: string, idadeEmMeses: number): string {
    if (!sexo || idadeEmMeses == null) return '';
    const macho = sexo === 'Macho';
    if (idadeEmMeses <= 12) return macho ? 'Bezerro' : 'Bezerra';
    if (idadeEmMeses <= 24) return macho ? 'Garrote' : 'Novilha';
    if (idadeEmMeses <= 36) return macho ? 'Novilho' : 'Novilha';
    return macho ? 'Boi' : 'Vaca';
  }
}
