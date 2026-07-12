import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faShieldAlt, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { ColorModeService } from '@coreui/angular';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './configuracoes.component.html',
})
export class ConfiguracoesComponent {
  private colorMode = inject(ColorModeService);
  private auth = inject(AuthService);

  faUser = faUser;
  faShieldAlt = faShieldAlt;
  faMoon = faMoon;
  faSun = faSun;

  get nomeUsuario() { return this.auth.getUserNome() ?? '—'; }
  get tipoUsuario() { return this.auth.getUserTipo() ?? '—'; }

  setTheme(mode: 'light' | 'dark' | 'auto') {
    this.colorMode.colorMode.set(mode);
  }

  get currentMode() { return this.colorMode.colorMode(); }
}
