import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Fazenda } from '../models/entities.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FazendaService extends ApiService<Fazenda> {
    protected endpoint = 'fazenda';

    buscarPorNome(nome: string): Observable<Fazenda[]> {
        return this.http.get<Fazenda[]>(`${this.baseUrl}/api/fazenda/buscar?nome=${nome}`);
    }
}
