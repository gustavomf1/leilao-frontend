import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Taxas } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class TaxasService extends ApiService<Taxas> {
    protected endpoint = 'taxa-padrao';

    obterAtual(): Observable<Taxas> {
        return this.http.get<Taxas>(`${this.baseUrl}/api/${this.endpoint}/atual`);
    }

    override listar(): Observable<Taxas[]> {
        return this.obterAtual().pipe(map((taxa) => taxa ? [taxa] : []));
    }

    override salvar(entity: Taxas): Observable<Taxas> {
        return this.http.post<Taxas>(`${this.baseUrl}/api/${this.endpoint}`, {
            taxa: entity.taxa,
            comissaoVenda: entity.comissaoVenda,
            comissaoCompra: entity.comissaoCompra,
            gta: entity.gta,
        });
    }
}
