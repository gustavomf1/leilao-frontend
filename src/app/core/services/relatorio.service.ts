import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface VendedorResumo {
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
}
