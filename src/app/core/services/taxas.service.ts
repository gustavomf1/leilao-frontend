import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Taxas } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class TaxasService extends ApiService<Taxas> {
    protected endpoint = 'taxas-comissao'; // sem construtor necessário
}
