import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Raca } from '../models/entities.model';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class RacaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/racas`;

  listar(): Observable<Raca[]> {
    return this.http.get<Raca[]>(this.baseUrl);
  }

  listarTodas(): Observable<Raca[]> {
    return this.http.get<Raca[]>(`${this.baseUrl}/todas`);
  }

  listarPorEspecie(especieId: number): Observable<Raca[]> {
    return this.http.get<Raca[]>(`${this.baseUrl}/especie/${especieId}`);
  }

  buscarPorId(id: number): Observable<Raca> {
    return this.http.get<Raca>(`${this.baseUrl}/${id}`);
  }

  salvar(raca: { nome: string; especieId: number }): Observable<Raca> {
    return this.http.post<Raca>(this.baseUrl, raca);
  }

  atualizar(id: number, raca: { nome: string; especieId: number }): Observable<Raca> {
    return this.http.put<Raca>(`${this.baseUrl}/${id}`, raca);
  }

  inativar(id: number): Observable<Raca> {
    return this.http.patch<Raca>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
