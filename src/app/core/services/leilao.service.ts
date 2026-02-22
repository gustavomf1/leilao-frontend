import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Leilao } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class LeilaoService extends ApiService<Leilao> {
    protected endpoint = 'leiloes'; // sem construtor necessário
}
