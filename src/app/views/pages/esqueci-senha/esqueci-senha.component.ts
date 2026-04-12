import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { RecuperacaoSenhaService } from '../../../core/services/recuperacao-senha.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-esqueci-senha',
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.scss'],
  imports: [ReactiveFormsModule, IconDirective, CardComponent, CardBodyComponent, ButtonDirective, RouterLink]
})
export class EsqueciSenhaComponent {
  private fb = inject(FormBuilder);
  private service = inject(RecuperacaoSenhaService);
  private alert = inject(AlertService);

  enviado = signal(false);
  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const email = this.form.getRawValue().email!;
    this.service.solicitar(email).subscribe({
      next: () => {
        this.enviado.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.alert.error(err.error?.mensagem || 'Erro ao solicitar recuperação');
        this.loading.set(false);
      }
    });
  }
}
