import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { MapaLeilaoComponent } from './mapa-leilao.component';
import { RelatorioService } from '../../../core/services/relatorio.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('MapaLeilaoComponent', () => {
  let component: MapaLeilaoComponent;
  let fixture: ComponentFixture<MapaLeilaoComponent>;
  let mockRelatorioService: any;
  let mockLeilaoService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockRelatorioService = { gerarMapaLeilao: vi.fn().mockReturnValue(of(new Blob())) };
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of([{ id: 1, descricao: 'Leilão X' }] as any)) };
    mockAlert = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MapaLeilaoComponent],
      providers: [
        { provide: RelatorioService, useValue: mockRelatorioService },
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaLeilaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega os leilões', () => {
    expect(mockLeilaoService.listar).toHaveBeenCalled();
    expect(component.leiloes).toEqual([{ id: 1, descricao: 'Leilão X' }] as any);
  });

  it('canGenerate só é true com leilão selecionado e sem loading', () => {
    expect(component.canGenerate).toBe(false);
    component.selectedLeilaoId = 1;
    expect(component.canGenerate).toBe(true);
  });

  it('gerarMapa() não faz nada sem leilão selecionado', () => {
    component.gerarMapa();
    expect(mockRelatorioService.gerarMapaLeilao).not.toHaveBeenCalled();
  });

  it('gerarMapa() abre o PDF em nova aba e desliga o loading', () => {
    component.selectedLeilaoId = 1;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarMapa();

    expect(mockRelatorioService.gerarMapaLeilao).toHaveBeenCalledWith(1);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');
    expect(component.loading).toBe(false);
  });

  it('gerarMapa() mostra alerta de erro quando falha', () => {
    component.selectedLeilaoId = 1;
    mockRelatorioService.gerarMapaLeilao.mockReturnValue(throwError(() => ({})));

    component.gerarMapa();

    expect(mockAlert.error).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
