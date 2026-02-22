import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  message: string;
  color?: 'success' | 'danger' | 'warning' | 'info' | 'primary';
  dismissible?: boolean;
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertSubject = new Subject<Alert>();
  alert$ = this.alertSubject.asObservable();

  success(message: string) {
    this.alertSubject.next({ message, color: 'success', dismissible: true, delay: 4000 });
  }

  error(message: string) {
    this.alertSubject.next({ message, color: 'danger', dismissible: true, delay: 5000 });
  }

  warning(message: string) {
    this.alertSubject.next({ message, color: 'warning', dismissible: true, delay: 4000 });
  }

  info(message: string) {
    this.alertSubject.next({ message, color: 'info', dismissible: true, delay: 4000 });
  }
}