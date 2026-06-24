import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { FaturaEnvioLog } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class FaturaEnvioService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  enviarFaturaCompra(loteId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/faturas/enviar/compra`, null, {
      params: new HttpParams().set('loteId', loteId)
    });
  }

  enviarFaturaVenda(loteId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/faturas/enviar/venda`, null, {
      params: new HttpParams().set('loteId', loteId)
    });
  }

  enviarTodasFaturas(leilaoId: number, apenasNaoEnviados: boolean): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/faturas/enviar-todas`, null, {
      params: new HttpParams()
        .set('leilaoId', leilaoId)
        .set('apenasNaoEnviados', apenasNaoEnviados)
    });
  }

  buscarLogs(leilaoId: number): Observable<Record<string, FaturaEnvioLog>> {
    return this.http.get<Record<string, FaturaEnvioLog>>(`${this.baseUrl}/api/faturas/log`, {
      params: new HttpParams().set('leilaoId', leilaoId)
    });
  }
}
