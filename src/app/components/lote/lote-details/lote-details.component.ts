import { Component, OnInit, inject, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule, GridModule,
  ModalModule, ModalComponent
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LoteService } from '../../../core/services/lote.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { EspecieService } from '../../../core/services/especie.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { Especie, LeilaoDetalhes, Cliente } from '../../../core/models/entities.model';

@Component({
  selector: 'app-lotes-details',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    CardModule, ButtonDirective, FormModule, GridModule,
    ModalModule, FontAwesomeModule
  ],
  templateUrl: './lote-details.component.html',
  styleUrl: './lote-details.component.css'
})
export class LotesDetailsComponent implements OnInit {
  private el             = inject(ElementRef);
  private cdr            = inject(ChangeDetectorRef);
  private service        = inject(LoteService);
  private alert          = inject(AlertService);
  auth                   = inject(AuthService);
  private especieService = inject(EspecieService);
  private leilaoService  = inject(LeilaoService);
  private clienteService = inject(ClienteService);

  faSave      = faSave;
  faArrowLeft = faArrowLeft;
  faCheck     = faCheck;
  faTimes     = faTimes;

  form!: FormGroup;
  isEdicao      = false;
  modalVisible  = false;
  private entityId?: number;

  especies: Especie[]          = [];
  leiloes: LeilaoDetalhes[]    = [];
  clientes: Cliente[]          = [];
  clientesFiltrados: Cliente[] = [];
  vendedorBusca                = '';
  mostrarDropdownVendedor      = false;
  vendedorSelecionado: Cliente | null = null;

  compradorBusca               = '';
  mostrarDropdownComprador     = false;
  compradorSelecionado: Cliente | null = null;
  compradorFiltrados: Cliente[] = [];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.mostrarDropdownVendedor  = false;
      this.mostrarDropdownComprador = false;
    }
  }

  get isManejoMode(): boolean {
    return this.auth.isManejo();
  }

  get isEscritorioMode(): boolean {
    return !this.auth.isManejo() && !this.auth.isAdmin();
  }

  // Dados formatados para exibir no modal de confirmação
  get resumoParaConfirmacao(): { label: string; valor: any }[] {
    const f = this.form.getRawValue();
    return [
      { label: 'Código',           valor: f.codigo },
      { label: 'Qtd. Animais',     valor: f.qntdAnimais },
      { label: 'Sexo',             valor: f.sexo },
      { label: 'Espécie',          valor: this.especies.find(e => e.id === f.especieId)?.nome ?? f.especieId },
      { label: 'Raça',             valor: f.raca },
      { label: 'Categoria',        valor: f.categoriaAnimal },
      { label: 'Idade (meses)',    valor: f.idadeEmMeses },
      { label: 'Peso (kg)',        valor: f.peso },
      { label: 'Vendedor',         valor: f.vendedorNomeRascunho || '—' },
      { label: 'Observações',      valor: f.obs || '—' },
    ].filter(i => i.valor !== null && i.valor !== undefined);
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      codigo:               ['', Validators.required],
      qntdAnimais:          [1,  [Validators.required, Validators.min(1)]],
      sexo:                 ['', Validators.required],
      idadeEmMeses:         [0,  [Validators.required, Validators.min(0)]],
      peso:                 [0,  [Validators.required, Validators.min(0)]],
      raca:                 ['', Validators.required],
      especieId:            [null, Validators.required],
      categoriaAnimal:      ['', Validators.required],
      obs:                  [''],
      leilaoId:             [null],
      vendedorNomeRascunho: [''],
      vendedorId:           [null],
      compradorId:          [null],
      precoCompra:          [null]
    });

    if (this.isManejoMode) {
      this.form.get('precoCompra')?.clearValidators();
      this.form.get('vendedorId')?.clearValidators();
      this.form.get('compradorId')?.clearValidators();
      this.form.get('precoCompra')?.updateValueAndValidity();
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
        this.cdr.detectChanges();
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao  = true;
      this.entityId  = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next:  (data) => this.form.patchValue(data),
        error: (err)  => this.alert.error(err.error?.mensagem || 'Erro ao carregar lote')
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
    const op = this.isEdicao
      ? this.service.atualizar(this.entityId!, dados)
      : this.service.salvar(dados);
    op.subscribe({
      next: () => {
        this.alert.success(this.isEdicao ? 'Lote atualizado!' : 'Lote cadastrado e enviado para preenchimento de preço!');
        this.router.navigate(['/lotes/lista']);
      },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar lote')
    });
  }
}
