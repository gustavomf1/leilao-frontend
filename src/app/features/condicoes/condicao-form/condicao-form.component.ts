import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-condicao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './condicao-form.component.html',
  styleUrl: './condicao-form.component.css'
})
export class CondicaoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CondicoesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alert = inject(AlertService);

  isEdicao = false;
  condicaoId?: number;

  tiposCondicao = ['ELITE', 'LEITE', 'CORTE', 'PRENHEZ', 'OUTROS', 'DOACAO'];
  aceitesIntegrado = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'DESCONTAR_TODAS_PARCELAS', label: 'Descontar em Todas as Parcelas' },
    { value: 'DESCONTAR_PRIMEIRA_PARCELA', label: 'Descontar na Primeira Parcela' }
  ];

  form = this.fb.group({
    descricao:          ['', Validators.required],
    captacao:           [null as number | null],
    parcelas:           [null as number | null],
    qtdDias:            [null as number | null],
    percentualDesconto: [null as number | null],
    comEntrada:         ['N'],
    mesmoDia:           ['N'],
    tipoCondicao:       [null as string | null],
    aceiteIntegrado:    ['NORMAL']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.condicaoId = +id;
      this.service.buscarPorId(this.condicaoId).subscribe({
        next: data => this.form.patchValue(data),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar condição')
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const dados = this.form.getRawValue() as any;
      const op = this.isEdicao ? this.service.atualizar(this.condicaoId!, dados) : this.service.salvar(dados);
      op.subscribe({
        next: () => this.router.navigate(['/app/condicoes']),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar condição')
      });
    }
  }

  voltar() { this.router.navigate(['/app/condicoes']); }
}
