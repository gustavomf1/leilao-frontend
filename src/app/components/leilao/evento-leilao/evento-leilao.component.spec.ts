import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventoLeilaoComponent } from './evento-leilao.component';
import { LeilaoService } from '../../../core/services/leilao.service';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoteFotoService } from '../../../core/services/lote-foto.service';

describe('EventoLeilaoComponent — galeria de fotos', () => {
  let component: EventoLeilaoComponent;
  let fixture: ComponentFixture<EventoLeilaoComponent>;

  const fotosMock = [
    { id: 1, loteId: 3, r2Key: 'lotes/3/a.jpg', ordem: 0, uploadedAt: '2026-01-01', viewUrl: 'https://minio.local/a.jpg' }
  ];
  const mockLoteFotoService = { listar: vi.fn().mockReturnValue(of(fotosMock)) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoLeilaoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LeilaoService, useValue: { buscarDetalhes: vi.fn().mockReturnValue(of({ status: 'EM_ANDAMENTO' })), buscarResumo: vi.fn().mockReturnValue(of({ lotes: [] })) } },
        { provide: LoteService, useValue: { registrarPreco: vi.fn() } },
        { provide: LoteWebsocketService, useValue: { conectar: vi.fn(), desconectar: vi.fn(), novoLoteSubject: new Subject() } },
        { provide: AlertService, useValue: { error: vi.fn(), success: vi.fn(), confirm: vi.fn(), warning: vi.fn() } },
        { provide: AuthService, useValue: { isAdmin: vi.fn().mockReturnValue(true), isManejo: vi.fn().mockReturnValue(false), hasPermission: vi.fn().mockReturnValue(true) } },
        { provide: LoteFotoService, useValue: mockLoteFotoService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoLeilaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('abrirGaleria busca as fotos do lote e abre o modal', () => {
    component.abrirGaleria({ id: 3, codigo: 'L-003' } as any);
    expect(mockLoteFotoService.listar).toHaveBeenCalledWith(3);
    expect(component.galeriaFotos).toEqual(fotosMock);
    expect(component.galeriaVisivel).toBe(true);
  });

  it('fecharGaleria fecha o modal e limpa as fotos', () => {
    component.abrirGaleria({ id: 3, codigo: 'L-003' } as any);
    component.fecharGaleria();
    expect(component.galeriaVisivel).toBe(false);
    expect(component.galeriaFotos).toEqual([]);
  });
});
