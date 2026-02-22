import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Fazenda } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class FazendaService extends ApiService<Fazenda> {
    protected endpoint = 'fazendas'; // sem construtor necessário
}
