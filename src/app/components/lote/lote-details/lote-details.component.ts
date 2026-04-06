import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule, GridModule,
  ModalModule, ModalComponent
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LoteService } from '../../../core/services/lote.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-lotes-details',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, ButtonDirective, FormModule, GridModule,
    ModalModule, FontAwesomeModule
  ],
  templateUrl: './lote-details.component.html',
  styleUrl: './lote-details.component.css'
})
export class LotesDetailsComponent implements OnInit {
  private service  = inject(LoteService);
  private alert    = inject(AlertService);
  auth             = inject(AuthService);

  faSave      = faSave;
  faArrowLeft = faArrowLeft;
  faCheck     = faCheck;
  faTimes     = faTimes;

  form!: FormGroup;
  isEdicao      = false;
  modalVisible  = false;
  private entityId?: number;

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
      { label: 'Espécie',          valor: f.especie },
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
      especie:              ['', Validators.required],
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
