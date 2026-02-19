import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class LoteWebsocketService {

  private stompClient!: Client;
  public novoLoteSubject = new Subject<any>();

  constructor() {
    this.conectar();
  }

  private conectar() {
        const token = localStorage.getItem('auth_token');
        
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8080/ws-leilao?token=${token}`),
            reconnectDelay: 5000,
            onConnect: (frame) => {
            console.log('Conectado ao WebSocket do AgroLance: ' + frame);
            this.stompClient.subscribe('/topic/lotes', (mensagem) => {
                if (mensagem.body) {
                const lote = JSON.parse(mensagem.body);
                this.novoLoteSubject.next(lote);
                }
            });
            },
            onStompError: (frame) => {
            console.error('Erro no WebSocket:', frame);
            }
        });

        this.stompClient.activate();
    }
}