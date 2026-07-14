import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventoPublicoComponent } from './evento-publico.component';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';

describe('EventoPublicoComponent — galeria de fotos por lote', () => {
  let component: EventoPublicoComponent;
  let fixture: ComponentFixture<EventoPublicoComponent>;

  const lotesMock = [{ id: 1, codigo: 'L-001', status: 'AGUARDANDO_LANCE' }];
  const fotosMock = [
    { id: 1, loteId: 1, r2Key: 'lotes/1/a.jpg', ordem: 0, uploadedAt: '2026-01-01', viewUrl: 'https://minio.local/a.jpg' }
  ];

  const mockLoteService = {
    listarPorLeilaoPublico: vi.fn().mockReturnValue(of(lotesMock)),
    listarFotosPublico: vi.fn().mockReturnValue(of(fotosMock)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoPublicoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoteService, useValue: mockLoteService },
        { provide: LoteWebsocketService, useValue: { conectar: vi.fn(), desconectar: vi.fn(), novoLoteSubject: new Subject() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carrega as fotos de cada lote listado', () => {
    expect(mockLoteService.listarFotosPublico).toHaveBeenCalledWith(1);
    expect(component.fotosPorLote[1]).toEqual(fotosMock);
  });
});
