import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class RecuperacaoSenhaService {
  private url = `${environment.backendUrl}/api/senha`;

  constructor(private http: HttpClient) {}

  validar(token: string) {
    return this.http.get(`${this.url}/validar`, { params: { token }, responseType: 'text' });
  }

  solicitar(email: string) {
    return this.http.post(`${this.url}/solicitar`, { email });
  }

  redefinir(token: string, novaSenha: string) {
    return this.http.post(`${this.url}/redefinir`, { token, novaSenha });
  }
}
