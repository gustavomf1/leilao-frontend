import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Leilao } from '../models/leilao.model';

@Injectable({ providedIn: 'root' })
export class LeilaoService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/leiloes';

  listar(): Observable<Leilao[]> {
    return this.http.get<Leilao[]>(this.API);
  }

  buscarPorId(id: number): Observable<Leilao> {
    return this.http.get<Leilao>(`${this.API}/${id}`);
  }

  salvar(leilao: Leilao): Observable<Leilao> {
    return this.http.post<Leilao>(this.API, leilao);
  }

  atualizar(id: number, leilao: Leilao): Observable<Leilao> {
    return this.http.put<Leilao>(`${this.API}/${id}`, leilao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
