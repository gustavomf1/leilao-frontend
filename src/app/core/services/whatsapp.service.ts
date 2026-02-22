import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  WhatsAppTextMessage,
  WhatsAppMediaMessage,
  WhatsAppBulkTextMessage,
  WhatsAppBulkMediaMessage
} from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  enviarTexto(msg: WhatsAppTextMessage): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/messages/send/text`, msg);
  }

  enviarMidia(msg: WhatsAppMediaMessage): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/messages/send/media`, msg);
  }

  enviarTextoEmMassa(msg: WhatsAppBulkTextMessage): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/messages/send/bulk`, msg);
  }

  enviarMidiaEmMassa(msg: WhatsAppBulkMediaMessage): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/messages/send/bulk/media`, msg);
  }
}
