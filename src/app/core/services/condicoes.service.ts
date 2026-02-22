import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Condicoes } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class CondicoesService extends ApiService<Condicoes> {
    protected endpoint = 'condicoes'; // sem construtor necessário
}
