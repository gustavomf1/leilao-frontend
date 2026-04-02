import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-condicoes-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './condicoes-details.component.html',
})
export class CondicoesDetailsComponent implements OnInit {
  private service = inject(CondicoesService);
  private alert = inject(AlertService);

  faSave = faSave;
  faArrowLeft = faArrowLeft;

  form!: FormGroup;
  isEdicao = false;
  private entityId?: number;

  tiposCondicao = ['ELITE', 'LEITE', 'CORTE', 'PRENHEZ', 'OUTROS', 'DOACAO'];
  aceitesIntegrado = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'DESCONTAR_TODAS_PARCELAS', label: 'Descontar em Todas as Parcelas' },
    { value: 'DESCONTAR_PRIMEIRA_PARCELA', label: 'Descontar na Primeira Parcela' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      descricao:          ['', Validators.required],
      captacao:           [null],
      parcelas:           [null],
      qtdDias:            [null],
      percentualDesconto: [null],
      comEntrada:         ['N'],
      mesmoDia:           ['N'],
      tipoCondicao:       [null],
      aceiteIntegrado:    ['NORMAL']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar condição')
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: () => {
          this.alert.success(this.isEdicao ? 'Condição atualizada!' : 'Condição cadastrada!');
          this.router.navigate(['/condicoes/lista']);
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar condição')
      });
    }
  }
}
