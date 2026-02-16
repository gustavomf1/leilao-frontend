import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core'; // 'inject' com 'i' minúsculo
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Agora o Angular sabe de onde vem essa função 'inject'
  private http = inject(HttpClient);

  private readonly API = 'http://localhost:8080/api/login';

  login(dados: LoginRequest) {
    return this.http.post<LoginResponse>(this.API, dados).pipe(
      tap(res => {
        // Armazena o token para as próximas requisições
        localStorage.setItem('auth_token', res.token);
      })
    );
  }

  isLoggedIn(): boolean {
    // Retorna true se houver token, false se for null/undefined
    return !!localStorage.getItem('auth_token');
  }

  // Dica: Adicione um método de logout para limpar o token depois
  logout() {
    localStorage.removeItem('auth_token');
  }
}