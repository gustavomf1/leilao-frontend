import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Funcionario } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class FuncionarioService extends ApiService<Funcionario> {
  protected endpoint = 'funcionarios';
}
