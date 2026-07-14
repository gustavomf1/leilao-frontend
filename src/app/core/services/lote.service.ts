import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lote } from '../models/entities.model';
import { LoteFoto } from './lote-foto.service';

@Injectable({ providedIn: 'root' })
export class LoteService extends ApiService<Lote> {
  protected endpoint = 'lote';

  listarPorLeilaoPublico(leilaoId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.baseUrl}/api/publico/leilao/${leilaoId}/lotes`);
  }

  registrarPrecoPublico(id: number, precoCompra: number, compradorNomeRascunho: string): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/publico/lote/${id}/preco`, { precoCompra, compradorNomeRascunho });
  }

  avancarStatus(id: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/status/avancar`, {});
  }

  registrarPreco(
    id: number,
    precoCompra: number,
    dadosExtras: { compradorId?: number | null; comissaoVenda?: number | null; comissaoCompra?: number | null } = {}
  ): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/preco`, { precoCompra, ...dadosExtras });
  }

  validarFinal(id: number, dados: { compradorId: number; comissaoVenda?: number | null; comissaoCompra?: number | null }): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/validar-final`, dados);
  }

  gerarNotaLeilao(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/relatorios/nota-leilao/${id}`, {
      responseType: 'blob',
    });
  }

  recolocarLance(id: number, dados: { comissaoVenda?: number | null; comissaoCompra?: number | null; naoVendidoNoLeilao?: string }): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/recolocar-lance`, dados);
  }

  transferirLote(id: number, leilaoId: number): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/transferir`, { leilaoId });
  }

  definirPixVendedor(id: number, pixId: number | null): Observable<Lote> {
    return this.http.patch<Lote>(`${this.baseUrl}/api/${this.endpoint}/${id}/pix-vendedor`, { pixId });
  }

  listarFotosPublico(loteId: number): Observable<LoteFoto[]> {
    return this.http.get<LoteFoto[]>(`${this.baseUrl}/api/publico/lote/${loteId}/fotos`);
  }
}
