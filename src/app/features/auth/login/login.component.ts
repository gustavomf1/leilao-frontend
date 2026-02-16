import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(3)]]
  })

  onSubmit() {
    if (this.loginForm.valid) {
      const dados = this.loginForm.getRawValue() as any;
      this.authService.login(dados).subscribe({
        next: (res) => {
          console.log('Token recebido:', res.token);
          alert('Login realizado com sucesso!');
        },
        error: (err) => {
          console.error(err);
          alert('Falha no login: verifique suas credenciais.');
        }
      });
    }
  }
}
