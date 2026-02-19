import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lote } from '../models/lote.model';

@Injectable({ providedIn: 'root' })
export class LoteService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/lotes';

  listar(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.API);
  }

  buscarPorId(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.API}/${id}`);
  }

  salvar(lote: Lote): Observable<Lote> {
    return this.http.post<Lote>(this.API, lote);
  }

  atualizar(id: number, lote: Lote): Observable<Lote> {
    return this.http.put<Lote>(`${this.API}/${id}`, lote);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
