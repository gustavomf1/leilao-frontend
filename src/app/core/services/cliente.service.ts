import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cliente } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class ClienteService extends ApiService<Cliente> {
  protected endpoint = 'usuarios/clientes'; // sem construtor necessário
}
