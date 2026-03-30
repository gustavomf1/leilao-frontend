import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LoteWebsocketService } from './lote-websocket.service';

import { AuthService } from './auth.service';

const mockWsService = {novoLoteSubject: new Subject(), conectar: () => {}, desconectar: () => {}};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LoteWebsocketService, useValue: mockWsService }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
