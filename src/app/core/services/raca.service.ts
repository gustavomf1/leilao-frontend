import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Raca } from '../models/entities.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RacaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/racas`;

  listarTodas(): Observable<Raca[]> {
    return this.http.get<Raca[]>(`${this.baseUrl}/todas`);
  }

  buscarPorId(id: number): Observable<Raca> {
    return this.http.get<Raca>(`${this.baseUrl}/${id}`);
  }

  salvar(dto: { nome: string; especieId: number }): Observable<Raca> {
    return this.http.post<Raca>(this.baseUrl, dto);
  }

  atualizar(id: number, dto: { nome: string; especieId: number }): Observable<Raca> {
    return this.http.put<Raca>(`${this.baseUrl}/${id}`, dto);
  }

  toggleInativo(id: number): Observable<Raca> {
    return this.http.patch<Raca>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
