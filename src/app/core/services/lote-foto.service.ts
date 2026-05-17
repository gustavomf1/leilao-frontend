import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface PresignedUrlResponse {
  key: string;
  presignedUrl: string;
  expiresAt: string;
}

export interface LoteFoto {
  id: number;
  loteId: number;
  r2Key: string;
  ordem: number;
  uploadedAt: string;
  viewUrl: string;
}

@Injectable({ providedIn: 'root' })
export class LoteFotoService {
  private http = inject(HttpClient);
  private base = environment.backendUrl;

  getPresignedUrl(loteId: number, ext: string): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${this.base}/api/lote/${loteId}/fotos/presigned-url`,
      { ext }
    );
  }

  confirmar(loteId: number, key: string, ordem: number): Observable<LoteFoto> {
    return this.http.post<LoteFoto>(
      `${this.base}/api/lote/${loteId}/fotos/confirmar`,
      { key, ordem }
    );
  }

  listar(loteId: number): Observable<LoteFoto[]> {
    return this.http.get<LoteFoto[]>(`${this.base}/api/lote/${loteId}/fotos`);
  }

  deletar(loteId: number, fotoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/lote/${loteId}/fotos/${fotoId}`);
  }
}
