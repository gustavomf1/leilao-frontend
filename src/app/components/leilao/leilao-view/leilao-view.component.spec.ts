import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LeilaoViewComponent } from './leilao-view.component';
import { LeilaoService } from '../../../core/services/leilao.service';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { FaturaEnvioService } from '../../../core/services/fatura-envio.service';
import { LoteFotoService } from '../../../core/services/lote-foto.service';

describe('LeilaoViewComponent', () => {
  let component: LeilaoViewComponent;
  let fixture: ComponentFixture<LeilaoViewComponent>;

  let mockLeilaoService: any;
  let mockLoteService: any;
  let mockWsService: any;
  let mockAlert: any;
  let mockFaturaEnvioService: any;
  let novoLoteSubject: Subject<any>;

  const resumoMock = {
    id: 1, descricao: 'Leilão', local: 'x', cidade: 'y', uf: 'SP', data: '2026-01-01',
    totalLotes: 2, lotesVendidos: 1, lotesRestantes: 1, totalAnimais: 10, animaisVendidos: 5,
    movimentacaoBruta: 1000, receitaComissao: 100, ticketMedio: 1000,
    lotes: [
      { id: 10, leilaoId: 1, status: 'FINALIZADO', naoVendidoNoLeilao: 'N', compradorId: 9, precoCompra: 1000, peso: 100, qntdAnimais: 5 },
      { id: 11, leilaoId: 1, status: 'AGUARDANDO_LANCE', qntdAnimais: 5, peso: 50 },
    ],
  };
  const detalhesMock = { id: 1, status: 'ABERTO' };

  function setup() {
    TestBed.configureTestingModule({
      imports: [LeilaoViewComponent],
      providers: [
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: LoteService, useValue: mockLoteService },
        { provide: LoteWebsocketService, useValue: mockWsService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, isManejo: () => false, hasPermission: () => true } },
        { provide: FaturaEnvioService, useValue: mockFaturaEnvioService },
        { provide: LoteFotoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeilaoViewComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    novoLoteSubject = new Subject();
    mockLeilaoService = {
      buscarResumo: vi.fn().mockReturnValue(of(resumoMock)),
      buscarDetalhes: vi.fn().mockReturnValue(of(detalhesMock)),
      iniciarLeilao: vi.fn().mockReturnValue(of({ status: 'EM_ANDAMENTO' })),
      encerrarLeilao: vi.fn().mockReturnValue(of({ status: 'FINALIZADO' })),
    };
    mockLoteService = { listar: vi.fn().mockReturnValue(of(resumoMock.lotes)) };
    mockWsService = { conectar: vi.fn(), desconectar: vi.fn(), novoLoteSubject };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };
    mockFaturaEnvioService = {
      buscarLogs: vi.fn().mockReturnValue(of({})),
      enviarTodasFaturas: vi.fn().mockReturnValue(of({})),
      enviarFaturaCompra: vi.fn().mockReturnValue(of({})),
      enviarFaturaVenda: vi.fn().mockReturnValue(of({})),
    };
  });

  it('ngOnInit carrega o resumo, os detalhes e conecta o websocket', () => {
    setup();
    fixture.detectChanges();

    expect(mockLeilaoService.buscarResumo).toHaveBeenCalledWith(1);
    expect(mockLeilaoService.buscarDetalhes).toHaveBeenCalledWith(1);
    expect(mockWsService.conectar).toHaveBeenCalled();
    expect(component.resumo?.totalLotes).toBe(2);
  });

  it('carregarResumo() mostra alerta de erro quando falha', () => {
    setup();
    mockLeilaoService.buscarResumo.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('percentualVendido calcula a porcentagem de lotes vendidos', () => {
    setup();
    fixture.detectChanges();
    expect(component.percentualVendido).toBe(50);
  });

  it('lotesAguardandoLance e lotesFinalizados classificam os lotes pelo status', () => {
    setup();
    fixture.detectChanges();
    expect(component.totalAguardando).toBe(1);
    expect(component.totalFinalizados).toBe(1);
  });

  it('iniciarLeilao() pede confirmação e, ao confirmar, chama o service e recarrega o resumo', () => {
    setup();
    fixture.detectChanges();
    mockLeilaoService.buscarResumo.mockClear();

    component.iniciarLeilao();

    expect(mockLeilaoService.iniciarLeilao).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Leilão iniciado com sucesso!');
    expect(mockLeilaoService.buscarResumo).toHaveBeenCalled();
  });

  it('encerrarLeilao() chama o service e recarrega o resumo', () => {
    setup();
    fixture.detectChanges();

    component.encerrarLeilao();

    expect(mockLeilaoService.encerrarLeilao).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Leilão encerrado com sucesso!');
  });

  it('novoLoteSubject atualiza o monitor apenas para lotes do mesmo leilão', () => {
    setup();
    fixture.detectChanges();

    novoLoteSubject.next({ id: 99, leilaoId: 2, status: 'AGUARDANDO_LANCE' });
    expect(component.resumo?.lotes.some(l => l.id === 99)).toBe(false);

    novoLoteSubject.next({ id: 20, leilaoId: 1, status: 'AGUARDANDO_LANCE', qntdAnimais: 1 });
    expect(component.resumo?.lotes.some(l => l.id === 20)).toBe(true);
  });

  it('gerarLink() copia a URL pública do leilão para a área de transferência', async () => {
    setup();
    fixture.detectChanges();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    component.gerarLink();
    await Promise.resolve();

    expect(writeText.mock.calls[0][0]).toContain('/publico/evento/1');
    expect(mockAlert.success).toHaveBeenCalledWith('Link copiado para a área de transferência!');
  });

  it('ngOnDestroy cancela a inscrição do websocket', () => {
    setup();
    fixture.detectChanges();
    expect(novoLoteSubject.observed).toBe(true);

    fixture.destroy();

    expect(novoLoteSubject.observed).toBe(false);
  });
});
