import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Lote } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PublicoLoteService {
  private http = inject(HttpClient);
  private base = environment.backendUrl;

  listarPorLeilao(leilaoId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.base}/api/publico/leilao/${leilaoId}/lotes`);
  }

  registrarPreco(id: number, precoCompra: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.base}/api/publico/lote/${id}/preco`, { precoCompra });
  }
}
