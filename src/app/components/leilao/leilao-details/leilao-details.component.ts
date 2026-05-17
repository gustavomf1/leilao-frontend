import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule, GridModule,
  ModalModule, TableModule, TableDirective
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faSearch, faCheck, faTimes, faGavel, faPercent, faFileLines, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
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
    ModalModule, TableModule, TableDirective,
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
  faCheck    = faCheck;
  faTimes    = faTimes;
  faGavel    = faGavel;
  faPercent  = faPercent;
  faFileLines = faFileLines;
  faMapMarker = faMapMarkerAlt;

  form!: FormGroup;
  isEdicao = false;
  private entityId?: number;
  private leilaoCarregado?: any;

  // Dados carregados
  taxaPadrao?: Taxas;
  condicoes: Condicoes[] = [];
  especies: Especie[] = [];
  tiposLeilao = Object.entries(TIPO_LEILAO_LABELS).map(([value, label]) => ({ value: value as TipoLeilao, label }));

  // Selecionados
  condicaoSelecionada?: Condicoes;

  // Modais
  modalCondicaoAberto = false;

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
      taxaPadraoId: [null],
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
          this.leilaoCarregado = this.normalizarLeilao(data);
          this.form.patchValue(this.leilaoCarregado);
          this.atualizarSelecionados();
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar leilão'),
      });
    }
  }

  private carregarDados() {
    this.taxaService.obterAtual().subscribe({
      next: (data) => {
        this.taxaPadrao = data;
        if (!this.isEdicao && data?.id && !this.form.get('taxaPadraoId')?.value) {
          this.form.patchValue({ taxaPadraoId: data.id });
        }
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('Erro ao carregar taxa padrão vigente'),
    });
    this.condicaoService.listar().subscribe({
      next: (data) => { this.condicoes = data; this.atualizarSelecionados(); this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar condições'),
    });
    this.especieService.listar().subscribe({
      next: (data) => { this.especies = data; this.cdr.detectChanges(); },
    });
  }

  tipoLabel(tipo: TipoLeilao): string {
    return TIPO_LEILAO_LABELS[tipo] ?? tipo;
  }

  // ── Seleção de Condição ───────────────────────────────────────

  selecionarCondicao(condicao: Condicoes) {
    this.condicaoSelecionada = condicao;
    this.form.patchValue({ condicoesId: condicao.id });
    this.modalCondicaoAberto = false;
    this.cdr.detectChanges();
  }

  private normalizarLeilao(data: any): any {
    const condicoesId = data.condicoesId ?? data.condicoes_id ?? data.condicao?.id ?? null;
    const especieId = data.especieId ?? data.especie?.id ?? null;
    const taxaPadraoId = data.taxaPadraoId ?? data.taxaPadrao?.id ?? null;
    return { ...data, condicoesId, especieId, taxaPadraoId };
  }

  private atualizarSelecionados() {
    const condicoesId = this.form?.get('condicoesId')?.value ?? this.leilaoCarregado?.condicoesId;
    if (condicoesId) {
      this.condicaoSelecionada = this.condicoes.find(c => c.id === condicoesId);
    }
  }

  // ── Salvar Leilão ─────────────────────────────────────────────

  salvar() {
    if (this.form.valid) {
      const dados = {
        ...this.form.getRawValue(),
        uf: String(this.form.get('uf')?.value || '').toUpperCase(),
      };
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
