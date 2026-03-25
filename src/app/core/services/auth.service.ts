import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface TokenPayload {
  sub: string;
  nome: string;
  tipo: string;
  isAdmin: boolean;
  roles: string[];
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly API = `${environment.backendUrl}/api/login`;

  login(dados: LoginRequest) {
    return this.http.post<LoginResponse>(this.API, dados).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.token);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getTokenPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    const payload = this.getTokenPayload();
    return payload?.isAdmin === true;
  }

  getUserRoles(): string[] {
    const payload = this.getTokenPayload();
    return payload?.roles ?? [];
  }

  getUserNome(): string {
    const payload = this.getTokenPayload();
    return payload?.nome ?? '';
  }

  getUserTipo(): string {
    const payload = this.getTokenPayload();
    return payload?.tipo ?? '';
  }
}
