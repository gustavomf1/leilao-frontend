import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { LoteService } from '../../../core/services/lote.service';

@Component({
  selector: 'app-lote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './lote-form.component.html',
  styleUrl: './lote-form.component.css'
})
export class LoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(LoteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdicao = false;
  loteId?: number;

  form = this.fb.group({
    codigo: ['', Validators.required],
    qntd_animais: [0, [Validators.required, Validators.min(1)]],
    sexo: ['', Validators.required],
    idade_em_meses: [0, [Validators.required, Validators.min(0)]],
    peso: [0, [Validators.required, Validators.min(0)]],
    raca: ['', Validators.required],
    especie: ['', Validators.required],
    categoria_animal: ['', Validators.required],
    obs: [''],
    leilao_id: [null as number | null],
    vendedor_id: [null as number | null],
    comprador_id: [null as number | null],
    preco_compra: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.loteId = +id;
      this.service.buscarPorId(this.loteId).subscribe(data => this.form.patchValue(data));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const dados = this.form.getRawValue() as any;
      const op = this.isEdicao ? this.service.atualizar(this.loteId!, dados) : this.service.salvar(dados);
      op.subscribe(() => this.router.navigate(['/app/lotes']));
    }
  }

  voltar() { this.router.navigate(['/app/lotes']); }
}
