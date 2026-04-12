import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Leilao, LeilaoDetalhes } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class LeilaoService extends ApiService<Leilao> {
    protected endpoint = 'leiloes';

    buscarResumo(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/api/${this.endpoint}/${id}/resumo`);
    }

    buscarDetalhes(id: number): Observable<LeilaoDetalhes> {
        return this.http.get<LeilaoDetalhes>(`${this.baseUrl}/api/${this.endpoint}/${id}`);
    }

    iniciarLeilao(id: number): Observable<LeilaoDetalhes> {
        return this.http.patch<LeilaoDetalhes>(`${this.baseUrl}/api/${this.endpoint}/${id}/iniciar`, {});
    }

    encerrarLeilao(id: number): Observable<LeilaoDetalhes> {
        return this.http.patch<LeilaoDetalhes>(`${this.baseUrl}/api/${this.endpoint}/${id}/encerrar`, {});
    }
}
