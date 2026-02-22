import { Component, inject } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
} from '@coreui/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AlertService } from '../../../shared/services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    IconDirective,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    ReactiveFormsModule,
    FontAwesomeModule
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  showPassword: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(private alert: AlertService,
    private router: Router
  ) {}


  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(3)]]
  })

  togglePasswordVisibility(){
    this.showPassword = !this.showPassword;
  }

    onSubmit() {
    if (this.loginForm.valid) {
      const dados = this.loginForm.getRawValue() as any;
      this.authService.login(dados).subscribe({
        next: (res) => {
          this.alert.success("Login efetuado com sucesso!");
          const redirectUri = localStorage.getItem('redirectUri')
          if(redirectUri){
            this.router.navigateByUrl(redirectUri)
          }
          this.router.navigate(["dashboard"])
        },
        error: (err) => {
          this.alert.error(err.error.mensagem);
        }
      });
    }
  }
}
