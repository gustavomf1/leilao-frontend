import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especie } from '../models/entities.model';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class EspecieService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/especies`;

  listar(): Observable<Especie[]> {
    return this.http.get<Especie[]>(this.baseUrl);
  }

  listarTodas(): Observable<Especie[]> {
    return this.http.get<Especie[]>(`${this.baseUrl}/todas`);
  }

  buscarPorId(id: number): Observable<Especie> {
    return this.http.get<Especie>(`${this.baseUrl}/${id}`);
  }

  salvar(especie: { nome: string }): Observable<Especie> {
    return this.http.post<Especie>(this.baseUrl, especie);
  }

  atualizar(id: number, especie: { nome: string }): Observable<Especie> {
    return this.http.put<Especie>(`${this.baseUrl}/${id}`, especie);
  }

  inativar(id: number): Observable<Especie> {
    return this.http.patch<Especie>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
