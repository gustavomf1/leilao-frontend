import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CondicoesService } from '../../../core/services/condicoes.service';

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

  isEdicao = false;
  condicaoId?: number;

  form = this.fb.group({
    tipo: ['', Validators.required],
    descricao: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.condicaoId = +id;
      this.service.buscarPorId(this.condicaoId).subscribe(data => this.form.patchValue(data));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const dados = this.form.getRawValue() as any;
      const op = this.isEdicao ? this.service.atualizar(this.condicaoId!, dados) : this.service.salvar(dados);
      op.subscribe(() => this.router.navigate(['/app/condicoes']));
    }
  }

  voltar() { this.router.navigate(['/app/condicoes']); }
}
