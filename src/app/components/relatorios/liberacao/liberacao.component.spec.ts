import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { LiberacaoComponent } from './liberacao.component';
import { RelatorioService } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('LiberacaoComponent', () => {
  let component: LiberacaoComponent;
  let fixture: ComponentFixture<LiberacaoComponent>;
  let mockRelatorioService: any;
  let mockLeilaoService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockRelatorioService = {
      getVendedoresDoLeilao: vi.fn().mockReturnValue(of([{ id: 1, nome: 'João' }])),
      getCompradoresDoLeilao: vi.fn().mockReturnValue(of([{ id: 2, nome: 'Maria' }])),
      gerarLiberacaoRetorno: vi.fn().mockReturnValue(of(new Blob())),
      gerarLiberacaoCompra: vi.fn().mockReturnValue(of(new Blob())),
    };
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of([{ id: 1, descricao: 'Leilão X' }] as any)) };
    mockAlert = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LiberacaoComponent],
      providers: [
        { provide: RelatorioService, useValue: mockRelatorioService },
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LiberacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega os leilões', () => {
    expect(mockLeilaoService.listar).toHaveBeenCalled();
  });

  it('onLeilaoChange() carrega vendedores e compradores em paralelo', () => {
    component.selectedLeilaoId = 1;
    component.onLeilaoChange();

    expect(mockRelatorioService.getVendedoresDoLeilao).toHaveBeenCalledWith(1);
    expect(mockRelatorioService.getCompradoresDoLeilao).toHaveBeenCalledWith(1);
    expect(component.vendedores).toEqual([{ id: 1, nome: 'João' }] as any);
    expect(component.compradores).toEqual([{ id: 2, nome: 'Maria' }] as any);
  });

  it('onLeilaoChange() não busca nada quando não há leilão selecionado', () => {
    component.selectedLeilaoId = undefined;
    component.onLeilaoChange();
    expect(mockRelatorioService.getVendedoresDoLeilao).not.toHaveBeenCalled();
  });

  it('canGenerateRetorno/canGenerateCompra dependem da seleção e do loading', () => {
    component.selectedLeilaoId = 1;
    component.selectedVendedorId = 5;
    expect(component.canGenerateRetorno).toBe(true);
    expect(component.canGenerateCompra).toBe(false);

    component.selectedCompradorId = 6;
    expect(component.canGenerateCompra).toBe(true);
  });

  it('gerarRetorno() abre o PDF e usa o loading "retorno"', () => {
    component.selectedLeilaoId = 1;
    component.selectedVendedorId = 5;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarRetorno();

    expect(mockRelatorioService.gerarLiberacaoRetorno).toHaveBeenCalledWith(1, 5);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');
    expect(component.loading).toBeNull();
  });

  it('gerarRetorno() mostra alerta de erro quando falha', () => {
    component.selectedLeilaoId = 1;
    component.selectedVendedorId = 5;
    mockRelatorioService.gerarLiberacaoRetorno.mockReturnValue(throwError(() => ({})));

    component.gerarRetorno();

    expect(mockAlert.error).toHaveBeenCalled();
    expect(component.loading).toBeNull();
  });

  it('gerarCompra() abre o PDF e usa o loading "compra"', () => {
    component.selectedLeilaoId = 1;
    component.selectedCompradorId = 6;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarCompra();

    expect(mockRelatorioService.gerarLiberacaoCompra).toHaveBeenCalledWith(1, 6);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');
  });

  it('gerarCompra() mostra alerta de erro quando falha', () => {
    component.selectedLeilaoId = 1;
    component.selectedCompradorId = 6;
    mockRelatorioService.gerarLiberacaoCompra.mockReturnValue(throwError(() => ({})));

    component.gerarCompra();

    expect(mockAlert.error).toHaveBeenCalled();
  });
});
