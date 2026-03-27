import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Funcionario } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class FuncionarioService extends ApiService<Funcionario> {
  protected endpoint = 'usuario/funcionario';

  override deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/usuario/inativar/${id}`);
  }
}
