import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Condicoes } from '../models/condicoes.model';

@Injectable({ providedIn: 'root' })
export class CondicoesService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/condicoes';

  listar(): Observable<Condicoes[]> {
    return this.http.get<Condicoes[]>(this.API);
  }

  buscarPorId(id: number): Observable<Condicoes> {
    return this.http.get<Condicoes>(`${this.API}/${id}`);
  }

  salvar(condicao: Condicoes): Observable<Condicoes> {
    return this.http.post<Condicoes>(this.API, condicao);
  }

  atualizar(id: number, condicao: Condicoes): Observable<Condicoes> {
    return this.http.put<Condicoes>(`${this.API}/${id}`, condicao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
