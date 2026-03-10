import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubformService {
  private resultadoSubject = new Subject<{ chave: string; dados: any }>();
  resultado$ = this.resultadoSubject.asObservable();

  emitir(chave: string, dados: any) {
    this.resultadoSubject.next({ chave, dados });
  }
}