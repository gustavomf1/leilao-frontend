import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { FaturaCompraComponent } from './fatura-compra.component';
import { RelatorioService } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('FaturaCompraComponent', () => {
  let component: FaturaCompraComponent;
  let fixture: ComponentFixture<FaturaCompraComponent>;
  let mockRelatorioService: any;
  let mockLeilaoService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockRelatorioService = {
      getCompradoresDoLeilao: vi.fn().mockReturnValue(of([{ id: 3, nome: 'Maria' }])),
      gerarFaturaCompra: vi.fn().mockReturnValue(of(new Blob())),
    };
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of([{ id: 1, descricao: 'Leilão X' }] as any)) };
    mockAlert = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FaturaCompraComponent],
      providers: [
        { provide: RelatorioService, useValue: mockRelatorioService },
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FaturaCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega os leilões', () => {
    expect(mockLeilaoService.listar).toHaveBeenCalled();
    expect(component.leiloes).toEqual([{ id: 1, descricao: 'Leilão X' }] as any);
  });

  it('onLeilaoChange() carrega os compradores do leilão selecionado', () => {
    component.selectedLeilaoId = 1;
    component.onLeilaoChange();
    expect(mockRelatorioService.getCompradoresDoLeilao).toHaveBeenCalledWith(1);
    expect(component.compradores).toEqual([{ id: 3, nome: 'Maria' }] as any);
  });

  it('canGenerate só é true com leilão, comprador selecionados e sem loading', () => {
    expect(component.canGenerate).toBe(false);
    component.selectedLeilaoId = 1;
    component.selectedCompradorId = 3;
    expect(component.canGenerate).toBe(true);
  });

  it('gerarFatura() não faz nada sem leilão/comprador selecionados', () => {
    component.gerarFatura();
    expect(mockRelatorioService.gerarFaturaCompra).not.toHaveBeenCalled();
  });

  it('gerarFatura() abre o PDF em nova aba', () => {
    component.selectedLeilaoId = 1;
    component.selectedCompradorId = 3;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarFatura();

    expect(mockRelatorioService.gerarFaturaCompra).toHaveBeenCalledWith(1, 3);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');
  });

  it('gerarFatura() mostra alerta de erro quando falha', () => {
    component.selectedLeilaoId = 1;
    component.selectedCompradorId = 3;
    mockRelatorioService.gerarFaturaCompra.mockReturnValue(throwError(() => ({})));

    component.gerarFatura();

    expect(mockAlert.error).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
