import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface VendedorResumo {
  id: number;
  nome: string;
}

export interface CompradorResumo {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  gerarFaturaVenda(leilaoId: number, vendedorId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/relatorios/fatura-venda`, {
      params: { leilaoId, vendedorId },
      responseType: 'blob',
    });
  }

  getVendedoresDoLeilao(leilaoId: number): Observable<VendedorResumo[]> {
    return this.http.get<VendedorResumo[]>(
      `${this.baseUrl}/api/leiloes/${leilaoId}/vendedores`
    );
  }

  gerarFaturaCompra(leilaoId: number, compradorId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/relatorios/fatura-compra`, {
      params: { leilaoId, compradorId },
      responseType: 'blob',
    });
  }

  getCompradoresDoLeilao(leilaoId: number): Observable<CompradorResumo[]> {
    return this.http.get<CompradorResumo[]>(
      `${this.baseUrl}/api/leiloes/${leilaoId}/compradores`
    );
  }
}
