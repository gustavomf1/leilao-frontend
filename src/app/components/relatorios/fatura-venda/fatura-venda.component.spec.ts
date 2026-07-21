import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { FaturaVendaComponent } from './fatura-venda.component';
import { RelatorioService } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('FaturaVendaComponent', () => {
  let component: FaturaVendaComponent;
  let fixture: ComponentFixture<FaturaVendaComponent>;
  let mockRelatorioService: any;
  let mockLeilaoService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockRelatorioService = {
      getVendedoresDoLeilao: vi.fn().mockReturnValue(of([{ id: 1, nome: 'João' }])),
      gerarFaturaVenda: vi.fn().mockReturnValue(of(new Blob())),
    };
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of([{ id: 1, descricao: 'Leilão X' }] as any)) };
    mockAlert = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FaturaVendaComponent],
      providers: [
        { provide: RelatorioService, useValue: mockRelatorioService },
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FaturaVendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega os leilões', () => {
    expect(mockLeilaoService.listar).toHaveBeenCalled();
    expect(component.leiloes).toEqual([{ id: 1, descricao: 'Leilão X' }] as any);
  });

  it('onLeilaoChange() carrega os vendedores do leilão selecionado e reseta a seleção anterior', () => {
    component.selectedVendedorId = 5;
    component.selectedLeilaoId = 1;

    component.onLeilaoChange();

    expect(component.selectedVendedorId).toBeUndefined();
    expect(mockRelatorioService.getVendedoresDoLeilao).toHaveBeenCalledWith(1);
    expect(component.vendedores).toEqual([{ id: 1, nome: 'João' }] as any);
  });

  it('canGenerate só é true com leilão, vendedor selecionados e sem loading', () => {
    expect(component.canGenerate).toBe(false);
    component.selectedLeilaoId = 1;
    component.selectedVendedorId = 2;
    expect(component.canGenerate).toBe(true);
    component.loading = true;
    expect(component.canGenerate).toBe(false);
  });

  it('gerarFatura() não faz nada sem leilão/vendedor selecionados', () => {
    component.gerarFatura();
    expect(mockRelatorioService.gerarFaturaVenda).not.toHaveBeenCalled();
  });

  it('gerarFatura() abre o PDF em nova aba e limpa o loading', () => {
    component.selectedLeilaoId = 1;
    component.selectedVendedorId = 2;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarFatura();

    expect(mockRelatorioService.gerarFaturaVenda).toHaveBeenCalledWith(1, 2);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');
    expect(component.loading).toBe(false);
  });

  it('gerarFatura() mostra alerta de erro e limpa o loading quando falha', () => {
    component.selectedLeilaoId = 1;
    component.selectedVendedorId = 2;
    mockRelatorioService.gerarFaturaVenda.mockReturnValue(throwError(() => ({})));

    component.gerarFatura();

    expect(mockAlert.error).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
