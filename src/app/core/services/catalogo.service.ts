import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface VendedorResumo {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {

  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  gerarCatalogo(tipo: number, leilaoId: number): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}/api/catalogos/catalogo${tipo}`,
      {
        params: { leilaoId },
        responseType: 'blob',
      }
    );
  }
}