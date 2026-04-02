import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule, GridModule,
  ModalModule, TableModule, TableDirective, BadgeComponent
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faSearch, faPencil, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../../core/services/leilao.service';
import { TaxasService } from '../../../core/services/taxas.service';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { Taxas, Condicoes, Especie, TipoLeilao, TIPO_LEILAO_LABELS } from '../../../core/models/entities.model';

@Component({
  selector: 'app-leiloes-details',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, ButtonDirective, FormModule, GridModule,
    ModalModule, TableModule, TableDirective, BadgeComponent,
    FontAwesomeModule
  ],
  templateUrl: './leilao-details.component.html',
})
export class LeiloesDetailsComponent implements OnInit {
  private service      = inject(LeilaoService);
  private taxaService  = inject(TaxasService);
  private condicaoService = inject(CondicoesService);
  private especieService  = inject(EspecieService);
  private alert        = inject(AlertService);
  private cdr          = inject(ChangeDetectorRef);
  auth                 = inject(AuthService);

  faSave     = faSave;
  faArrowLeft = faArrowLeft;
  faSearch   = faSearch;
  faPencil   = faPencil;
  faCheck    = faCheck;
  faTimes    = faTimes;

  form!: FormGroup;
  formTaxaEdit!: FormGroup;
  isEdicao = false;
  private entityId?: number;

  // Dados carregados
  taxas: Taxas[]      = [];
  condicoes: Condicoes[] = [];
  especies: Especie[] = [];
  tiposLeilao = Object.entries(TIPO_LEILAO_LABELS).map(([value, label]) => ({ value: value as TipoLeilao, label }));

  // Selecionados
  taxaSelecionada?: Taxas;
  condicaoSelecionada?: Condicoes;

  // Modais
  modalTaxaAberto    = false;
  modalCondicaoAberto = false;

  // Edição inline de taxa
  editandoTaxaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      local:       ['', Validators.required],
      uf:          ['', [Validators.required, Validators.maxLength(2)]],
      cidade:      ['', Validators.required],
      descricao:   ['', Validators.required],
      data:        ['', Validators.required],
      condicoesId: [null, Validators.required],
      taxasId:     [null, Validators.required],
    });

    this.formTaxaEdit = this.fb.group({
      comissaoVendedor:  [0, [Validators.required, Validators.min(0)]],
      comissaoComprador: [0, [Validators.required, Validators.min(0)]],
      especieId:         [null, Validators.required],
      tipoLeilao:        ['', Validators.required],
      taxaPor:           ['ANIMAL', Validators.required],
    });

    this.carregarDados();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => {
          this.form.patchValue(data);
          if (data.taxas_id) {
            this.taxaSelecionada = this.taxas.find(t => t.id === data.taxas_id);
          }
          if (data.condicoes_id) {
            this.condicaoSelecionada = this.condicoes.find(c => c.id === data.condicoes_id);
          }
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar leilão'),
      });
    }
  }

  private carregarDados() {
    this.taxaService.listar().subscribe({
      next: (data) => { this.taxas = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar taxas'),
    });
    this.condicaoService.listar().subscribe({
      next: (data) => { this.condicoes = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar condições'),
    });
    this.especieService.listar().subscribe({
      next: (data) => { this.especies = data; this.cdr.detectChanges(); },
    });
  }

  tipoLabel(tipo: TipoLeilao): string {
    return TIPO_LEILAO_LABELS[tipo] ?? tipo;
  }

  // ── Seleção de Taxa ───────────────────────────────────────────

  selecionarTaxa(taxa: Taxas) {
    this.taxaSelecionada = taxa;
    this.form.patchValue({ taxasId: taxa.id });
    this.modalTaxaAberto = false;
    this.editandoTaxaId = null;
    this.cdr.detectChanges();
  }

  editarTaxa(taxa: Taxas) {
    this.editandoTaxaId = taxa.id!;
    this.formTaxaEdit.patchValue({
      comissaoVendedor:  taxa.comissaoVendedor,
      comissaoComprador: taxa.comissaoComprador,
      especieId:         taxa.especieId,
      tipoLeilao:        taxa.tipoLeilao,
      taxaPor:           taxa.taxaPor,
    });
  }

  salvarEdicaoTaxa(taxa: Taxas) {
    if (this.formTaxaEdit.invalid) return;
    const dados = this.formTaxaEdit.getRawValue();
    this.taxaService.atualizar(taxa.id!, dados).subscribe({
      next: (atualizada) => {
        const idx = this.taxas.findIndex(t => t.id === taxa.id);
        if (idx !== -1) this.taxas[idx] = atualizada as unknown as Taxas;
        if (this.taxaSelecionada?.id === taxa.id) this.taxaSelecionada = atualizada as unknown as Taxas;
        this.editandoTaxaId = null;
        this.alert.success('Taxa atualizada!');
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('Erro ao atualizar taxa'),
    });
  }

  cancelarEdicaoTaxa() {
    this.editandoTaxaId = null;
  }

  // ── Seleção de Condição ───────────────────────────────────────

  selecionarCondicao(condicao: Condicoes) {
    this.condicaoSelecionada = condicao;
    this.form.patchValue({ condicoesId: condicao.id });
    this.modalCondicaoAberto = false;
    this.cdr.detectChanges();
  }

  // ── Salvar Leilão ─────────────────────────────────────────────

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: () => {
          this.alert.success(this.isEdicao ? 'Leilão atualizado!' : 'Leilão cadastrado!');
          this.router.navigate(['/leiloes/lista']);
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar leilão'),
      });
    }
  }
}
