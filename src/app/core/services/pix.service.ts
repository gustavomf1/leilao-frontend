import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Pix } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PixService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  listarPorUsuario(usuarioId: number): Observable<Pix[]> {
    return this.http.get<Pix[]>(`${this.baseUrl}/api/pix/usuario/${usuarioId}`);
  }

  cadastrar(pix: Pix): Observable<Pix> {
    return this.http.post<Pix>(`${this.baseUrl}/api/pix`, pix);
  }

  deletar(pixId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/pix/${pixId}`);
  }
}
