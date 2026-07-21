import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CatalogoComponent } from './catalogo.component';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('CatalogoComponent', () => {
  let component: CatalogoComponent;
  let fixture: ComponentFixture<CatalogoComponent>;
  let mockCatalogoService: any;
  let mockLeilaoService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockCatalogoService = { gerarCatalogo: vi.fn().mockReturnValue(of(new Blob())) };
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of([{ id: 1, descricao: 'Leilão X' }] as any)) };
    mockAlert = { error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CatalogoComponent],
      providers: [
        { provide: CatalogoService, useValue: mockCatalogoService },
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponent);
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

  it('gerarCatalogo() não faz nada sem leilão selecionado', () => {
    component.gerarCatalogo(1);
    expect(mockCatalogoService.gerarCatalogo).not.toHaveBeenCalled();
  });

  it('gerarCatalogo() abre o PDF em nova aba e rastreia qual tipo está carregando', () => {
    component.selectedLeilaoId = 1;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarCatalogo(2);

    expect(mockCatalogoService.gerarCatalogo).toHaveBeenCalledWith(2, 1);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url');
    expect(component.loading).toBe(false);
    expect(component.loadingCatalogo).toBeNull();
  });

  it('gerarCatalogo() mostra alerta de erro quando falha', () => {
    component.selectedLeilaoId = 1;
    mockCatalogoService.gerarCatalogo.mockReturnValue(throwError(() => ({})));

    component.gerarCatalogo(2);

    expect(mockAlert.error).toHaveBeenCalledWith('Erro ao gerar catálogo');
    expect(component.loading).toBe(false);
  });

  it('onLeilaoChange() limpa o loadingCatalogo', () => {
    component.loadingCatalogo = 2;
    component.onLeilaoChange();
    expect(component.loadingCatalogo).toBeNull();
  });
});
