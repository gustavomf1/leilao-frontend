import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Taxas } from '../models/taxas.model';

@Injectable({ providedIn: 'root' })
export class TaxasService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/taxas';

  listar(): Observable<Taxas[]> {
    return this.http.get<Taxas[]>(this.API);
  }

  buscarPorId(id: number): Observable<Taxas> {
    return this.http.get<Taxas>(`${this.API}/${id}`);
  }

  salvar(taxa: Taxas): Observable<Taxas> {
    return this.http.post<Taxas>(this.API, taxa);
  }

  atualizar(id: number, taxa: Taxas): Observable<Taxas> {
    return this.http.put<Taxas>(`${this.API}/${id}`, taxa);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
