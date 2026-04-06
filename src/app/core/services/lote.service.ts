import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lote } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class LoteService extends ApiService<Lote> {
  protected endpoint = 'lote';

  avancarStatus(id: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/status/avancar`, {});
  }

  registrarPreco(id: number, precoCompra: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/preco`, { precoCompra });
  }
}
