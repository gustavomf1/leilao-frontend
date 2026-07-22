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

  it('exibe o código do lote com o prefixo fixo LOTE- no grid', () => {
    fixture.detectChanges();
    const texto = fixture.nativeElement.querySelector('.ep-cod')?.textContent.trim();
    expect(texto).toContain('LOTE-L-001');
  });

  it('confirmarEnvioLance formata o código do lote com prefixo LOTE- na mensagem de sucesso', () => {
    (component as any).loteService.registrarPrecoPublico = vi.fn().mockReturnValue(of({ id: 1, codigo: 'L-001', status: 'FINALIZADO' }));
    component.lancePendente = { lote: lotesMock[0], preco: 100, compradorNome: 'Zezin' } as any;

    component.confirmarEnvioLance();

    expect(component.sucesso).toContain('LOTE-L-001');
  });
});

describe('EventoPublicoComponent — busca por código do lote', () => {
  let component: EventoPublicoComponent;
  let fixture: ComponentFixture<EventoPublicoComponent>;

  const lotesMock = [
    { id: 1, codigo: '1', status: 'AGUARDANDO_LANCE' },
    { id: 2, codigo: '1A', status: 'AGUARDANDO_LANCE' },
    { id: 3, codigo: '2', status: 'AGUARDANDO_LANCE' },
    { id: 4, codigo: '10', status: 'AGUARDANDO_LANCE' },
  ];

  const mockLoteService = {
    listarPorLeilaoPublico: vi.fn().mockReturnValue(of(lotesMock)),
    listarFotosPublico: vi.fn().mockReturnValue(of([])),
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

  it('sem busca, mostra todos os lotes aguardando lance', () => {
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

  it('busca sem resultado exibe mensagem específica, sem confundir com "nenhum lote aguardando lance"', () => {
    component.buscaCodigo = '999';
    fixture.detectChanges();
    expect(component.lotesFiltrados.length).toBe(0);
    const texto = fixture.nativeElement.querySelector('.ep-vazio')?.textContent.trim();
    expect(texto).toContain('Nenhum lote encontrado com esse código');
  });
});
