import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { LeilaoService } from '../../../core/services/leilao.service';

@Component({
  selector: 'app-leilao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './leilao-form.component.html',
  styleUrl: './leilao-form.component.css'
})
export class LeilaoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(LeilaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdicao = false;
  leilaoId?: number;

  form = this.fb.group({
    local: ['', Validators.required],
    uf: ['', Validators.required],
    cidade: ['', Validators.required],
    descricao: ['', Validators.required],
    data: ['', Validators.required],
    condicoes_id: [null as number | null],
    taxas_id: [null as number | null]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.leilaoId = +id;
      this.service.buscarPorId(this.leilaoId).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const dados = this.form.getRawValue() as any;
      const op = this.isEdicao
        ? this.service.atualizar(this.leilaoId!, dados)
        : this.service.salvar(dados);
      op.subscribe(() => this.router.navigate(['/app/leiloes']));
    }
  }

  voltar() {
    this.router.navigate(['/app/leiloes']);
  }
}
