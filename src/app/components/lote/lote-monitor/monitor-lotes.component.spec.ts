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

describe('MonitorLotesComponent — código do lote com prefixo fixo', () => {
  let component: MonitorLotesComponent;
  let fixture: ComponentFixture<MonitorLotesComponent>;

  const loteMock = { id: 5, codigo: 'L-005', raca: 'Nelore', status: 'AGUARDANDO_LANCE' } as any;
  const mockLoteService = { listar: vi.fn().mockReturnValue(of([loteMock])) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorLotesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LoteWebsocketService, useValue: { novoLoteSubject: new Subject() } },
        { provide: LoteService, useValue: mockLoteService },
        { provide: LeilaoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
        { provide: AuthService, useValue: { isAdmin: vi.fn().mockReturnValue(true), isManejo: vi.fn().mockReturnValue(false), hasPermission: vi.fn().mockReturnValue(true) } },
        { provide: AlertService, useValue: { error: vi.fn(), success: vi.fn(), confirm: vi.fn() } },
        { provide: LoteFotoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe o código do lote com o prefixo fixo LOTE- no grid', () => {
    const texto = fixture.nativeElement.querySelector('.lote-id')?.textContent.trim();
    expect(texto).toBe('LOTE-L-005');
  });

  it('exibe o código com prefixo no modal de detalhes', () => {
    component.abrirDetalhes(loteMock);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Detalhes do Lote — LOTE-L-005');
  });

  it('exibe o código com prefixo no modal de transferência', () => {
    component.abrirModalTransferir(loteMock);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Enviar para próximo leilão — LOTE-L-005');
  });
});

describe('MonitorLotesComponent — busca por código do lote', () => {
  let component: MonitorLotesComponent;
  let fixture: ComponentFixture<MonitorLotesComponent>;

  const lotesMock = [
    { id: 1, codigo: '1', status: 'AGUARDANDO_LANCE' },
    { id: 2, codigo: '1A', status: 'AGUARDANDO_LANCE' },
    { id: 3, codigo: '2', status: 'AGUARDANDO_LANCE' },
    { id: 4, codigo: '10', status: 'AGUARDANDO_LANCE' },
  ] as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorLotesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LoteWebsocketService, useValue: { novoLoteSubject: new Subject() } },
        { provide: LoteService, useValue: { listar: vi.fn().mockReturnValue(of(lotesMock)) } },
        { provide: LeilaoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
        { provide: AuthService, useValue: { isAdmin: vi.fn().mockReturnValue(true), isManejo: vi.fn().mockReturnValue(false), hasPermission: vi.fn().mockReturnValue(true) } },
        { provide: AlertService, useValue: { error: vi.fn(), success: vi.fn(), confirm: vi.fn() } },
        { provide: LoteFotoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sem busca, mostra todos os lotes do filtro de status atual', () => {
    expect(component.lotesFiltrados.map(l => l.codigo)).toEqual(['1', '1A', '2', '10']);
  });

  it('buscar "1" mostra os códigos que começam com 1 (1, 1A, 10), mas não o 2', () => {
    component.buscaCodigo = '1';
    expect(component.lotesFiltrados.map(l => l.codigo)).toEqual(['1', '1A', '10']);
  });

  it('buscar "1a" (minúsculo) mostra só o lote 1A', () => {
    component.buscaCodigo = '1a';
    expect(component.lotesFiltrados.map(l => l.codigo)).toEqual(['1A']);
  });

  it('busca sem resultado exibe mensagem específica de busca', () => {
    component.buscaCodigo = '999';
    fixture.detectChanges();
    expect(component.lotesFiltrados.length).toBe(0);
    const texto = fixture.nativeElement.querySelector('.empty-text')?.textContent.trim();
    expect(texto).toContain('Nenhum lote encontrado com esse código');
  });
});
