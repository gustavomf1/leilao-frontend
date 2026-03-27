import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Cliente } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class ClienteService extends ApiService<Cliente> {
  protected endpoint = 'usuario/cliente'; // sem construtor necessário

  override deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/usuario/inativar/${id}`);
  }

  buscarPorNome(nome: string): Observable<Cliente[]> {
  return this.http.get<Cliente[]>(`${this.baseUrl}/api/usuario/cliente/buscar?nome=${nome}`);
  }
}
