import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fazenda } from '../models/fazenda.model';

@Injectable({ providedIn: 'root' })
export class FazendaService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/fazendas';

  listar(): Observable<Fazenda[]> {
    return this.http.get<Fazenda[]>(this.API);
  }

  buscarPorId(id: number): Observable<Fazenda> {
    return this.http.get<Fazenda>(`${this.API}/${id}`);
  }

  salvar(fazenda: Fazenda): Observable<Fazenda> {
    return this.http.post<Fazenda>(this.API, fazenda);
  }

  atualizar(id: number, fazenda: Fazenda): Observable<Fazenda> {
    return this.http.put<Fazenda>(`${this.API}/${id}`, fazenda);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
