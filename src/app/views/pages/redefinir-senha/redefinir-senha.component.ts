import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { CardBodyComponent, CardComponent, ButtonDirective } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { RecuperacaoSenhaService } from '../../../core/services/recuperacao-senha.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-redefinir-senha',
  templateUrl: './redefinir-senha.component.html',
  styleUrls: ['./redefinir-senha.component.scss'],
  imports: [ReactiveFormsModule, IconDirective, CardComponent, CardBodyComponent, ButtonDirective, RouterLink, FontAwesomeModule]
})
export class RedefinirSenhaComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private service = inject(RecuperacaoSenhaService);
  private alert = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = '';
  validando = signal(true);
  concluido = signal(false);
  tokenInvalido = signal(false);
  tokenErro = signal('');
  loading = signal(false);
  showPassword = signal(false);
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  form = this.fb.group({
    novaSenha: ['', [Validators.required, Validators.minLength(3)]]
  });

  private routeSub?: Subscription;
  private validarSub?: Subscription;

  ngOnInit() {
    this.routeSub = this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token') ?? '';

      if (!this.token) {
        this.router.navigate(['/login']);
        return;
      }

      // Reseta estado para o novo token
      this.validando.set(true);
      this.tokenInvalido.set(false);
      this.tokenErro.set('');
      this.concluido.set(false);
      this.loading.set(false);
      this.form.reset();

      // Cancela validação anterior se ainda estiver em curso
      this.validarSub?.unsubscribe();

      this.validarSub = this.service.validar(this.token).subscribe({
        next: () => {
          this.validando.set(false);
        },
        error: (err) => {
          try {
            const errorBody = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            this.tokenErro.set(errorBody?.mensagem || 'Token inválido');
          } catch {
            this.tokenErro.set('Token inválido');
          }
          this.tokenInvalido.set(true);
          this.validando.set(false);
        }
      });
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.validarSub?.unsubscribe();
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const novaSenha = this.form.getRawValue().novaSenha!;
    this.service.redefinir(this.token, novaSenha).subscribe({
      next: () => {
        this.concluido.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.alert.error(err.error?.mensagem || 'Erro ao redefinir senha');
        this.loading.set(false);
      }
    });
  }
}
