import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Usuario } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends ApiService<Usuario> {
    protected endpoint = 'usuarios'; // sem construtor necessário
}
