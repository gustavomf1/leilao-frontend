import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';

import { UsuariosListComponent } from './usuario-list.component';

const mockWsService = {novoLoteSubject: new Subject(), conectar: () => {}, desconectar: () => {}};

describe('UsuariosListComponent', () => {
  let component: UsuariosListComponent;
  let fixture: ComponentFixture<UsuariosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosListComponent],
      providers: [
        { provide: LoteWebsocketService, useValue: mockWsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
