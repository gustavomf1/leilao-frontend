import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Lote } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class LoteService extends ApiService<Lote> {
    protected endpoint = 'lotes'; // sem construtor necessário
}
