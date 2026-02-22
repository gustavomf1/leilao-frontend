import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  title?: string;
  color?: 'success' | 'danger' | 'warning' | 'info' | 'primary';
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  success(message: string, title = 'Sucesso') {
    this.toastSubject.next({ message, title, color: 'success', delay: 3000 });
  }

  error(message: string, title = 'Erro') {
    this.toastSubject.next({ message, title, color: 'danger', delay: 4000 });
  }

  warning(message: string, title = 'Atenção') {
    this.toastSubject.next({ message, title, color: 'warning', delay: 3000 });
  }

  info(message: string, title = 'Info') {
    this.toastSubject.next({ message, title, color: 'info', delay: 3000 });
  }
}