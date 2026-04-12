import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lote } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class LoteService extends ApiService<Lote> {
  protected endpoint = 'lote';

  listarPorLeilaoPublico(leilaoId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.baseUrl}/api/publico/leilao/${leilaoId}/lotes`);
  }

  registrarPrecoPublico(id: number, precoCompra: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/publico/lote/${id}/preco`, { precoCompra });
  }

  avancarStatus(id: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/status/avancar`, {});
  }

  registrarPreco(id: number, precoCompra: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/preco`, { precoCompra });
  }
}
