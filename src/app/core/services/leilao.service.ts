import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Leilao } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class LeilaoService extends ApiService<Leilao> {
    protected endpoint = 'leiloes';

    buscarResumo(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/api/${this.endpoint}/${id}/resumo`);
    }
}
