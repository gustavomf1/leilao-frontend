import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Role, AtribuirRoles, Funcionario } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/roles`;

  listar(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  criar(role: Role): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, role);
  }

  atualizar(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, role);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  atribuirRoles(funcionarioId: number, dto: AtribuirRoles): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.baseUrl}/funcionario/${funcionarioId}`, dto);
  }
}
