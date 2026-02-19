import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TaxasService } from '../../../core/services/taxas.service';

@Component({
  selector: 'app-taxa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './taxa-form.component.html',
  styleUrl: './taxa-form.component.css'
})
export class TaxaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(TaxasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdicao = false;
  taxaId?: number;

  form = this.fb.group({
    porcentagem: [0, [Validators.required, Validators.min(0)]],
    tipo_cliente: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.taxaId = +id;
      this.service.buscarPorId(this.taxaId).subscribe(data => this.form.patchValue(data));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const dados = this.form.getRawValue() as any;
      const op = this.isEdicao ? this.service.atualizar(this.taxaId!, dados) : this.service.salvar(dados);
      op.subscribe(() => this.router.navigate(['/app/taxas']));
    }
  }

  voltar() { this.router.navigate(['/app/taxas']); }
}
