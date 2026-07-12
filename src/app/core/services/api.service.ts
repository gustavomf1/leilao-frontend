import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaResponse } from '../models/pagina-response.model';

export abstract class ApiService<T> {
  protected http = inject(HttpClient);
  protected baseUrl = environment.backendUrl;
  protected abstract endpoint: string;

  listar(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/api/${this.endpoint}`);
  }

  listarPaginado(page: number, size: number, busca?: string): Observable<PaginaResponse<T>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (busca) {
      params = params.set('busca', busca);
    }
    return this.http.get<PaginaResponse<T>>(`${this.baseUrl}/api/${this.endpoint}/paginado`, { params });
  }

  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/api/${this.endpoint}/${id}`);
  }

  salvar(entity: T): Observable<T> {
    console.log(entity)
    return this.http.post<T>(`${this.baseUrl}/api/${this.endpoint}`, entity);
  }

  atualizar(id: number, entity: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/api/${this.endpoint}/${id}`, entity);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/${this.endpoint}/${id}`);
  }
}