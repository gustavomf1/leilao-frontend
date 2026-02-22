import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export abstract class ApiService<T> {
  protected http = inject(HttpClient);
  protected baseUrl = environment.backendUrl;
  protected abstract endpoint: string;

  listar(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/api/${this.endpoint}`);
  }

  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/api/${this.endpoint}/${id}`);
  }

  salvar(entity: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/api/${this.endpoint}`, entity);
  }

  atualizar(id: number, entity: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/api/${this.endpoint}/${id}`, entity);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/${this.endpoint}/${id}`);
  }
}