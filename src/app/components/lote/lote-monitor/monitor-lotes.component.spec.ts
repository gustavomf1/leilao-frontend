import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MonitorLotesComponent } from './monitor-lotes.component';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { LoteService } from '../../../core/services/lote.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { LoteFotoService } from '../../../core/services/lote-foto.service';

describe('MonitorLotesComponent — galeria de fotos no modal de detalhes', () => {
  let component: MonitorLotesComponent;
  let fixture: ComponentFixture<MonitorLotesComponent>;

  const fotosMock = [
    { id: 1, loteId: 5, r2Key: 'lotes/5/a.jpg', ordem: 0, uploadedAt: '2026-01-01', viewUrl: 'https://minio.local/a.jpg' }
  ];
  const mockLoteFotoService = { listar: vi.fn().mockReturnValue(of(fotosMock)) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorLotesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LoteWebsocketService, useValue: { novoLoteSubject: new Subject() } },
        { provide: LoteService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
        { provide: LeilaoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
        { provide: AuthService, useValue: { isAdmin: vi.fn().mockReturnValue(true), isManejo: vi.fn().mockReturnValue(false), hasPermission: vi.fn().mockReturnValue(true) } },
        { provide: AlertService, useValue: { error: vi.fn(), success: vi.fn(), confirm: vi.fn() } },
        { provide: LoteFotoService, useValue: mockLoteFotoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('abrirDetalhes busca as fotos do lote selecionado', () => {
    component.abrirDetalhes({ id: 5, codigo: 'L-005' } as any);
    expect(mockLoteFotoService.listar).toHaveBeenCalledWith(5);
    expect(component.galeriaFotos).toEqual(fotosMock);
  });

  it('fecharDetalhes limpa a galeria', () => {
    component.abrirDetalhes({ id: 5, codigo: 'L-005' } as any);
    component.fecharDetalhes();
    expect(component.galeriaFotos).toEqual([]);
  });
});
