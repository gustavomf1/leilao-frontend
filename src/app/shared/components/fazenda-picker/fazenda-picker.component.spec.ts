import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { FazendaPickerComponent } from './fazenda-picker.component';
import { FazendaService } from '../../../core/services/fazenda.service';
import { SubformService } from '../../services/subform.service';

describe('FazendaPickerComponent', () => {
  let component: FazendaPickerComponent;
  let fixture: ComponentFixture<FazendaPickerComponent>;
  let mockFazendaService: any;
  let mockSubformService: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    mockFazendaService = { buscarPorNome: vi.fn().mockReturnValue(of([{ id: 1, nome: 'Fazenda Boa Vista' }])) };
    mockSubformService = { emitir: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FazendaPickerComponent],
      providers: [
        { provide: FazendaService, useValue: mockFazendaService },
        { provide: SubformService, useValue: mockSubformService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FazendaPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('onBusca() não pesquisa com menos de 2 caracteres e limpa os resultados', () => {
    component.fazendas = [{ id: 9 }] as any;
    component.busca = 'a';

    component.onBusca();

    expect(component.fazendas).toEqual([]);
    expect(component.buscaFeita).toBe(false);
    expect(mockFazendaService.buscarPorNome).not.toHaveBeenCalled();
  });

  it('onBusca() pesquisa após o debounce quando há 2+ caracteres', () => {
    component.busca = 'bo';
    component.onBusca();
    vi.advanceTimersByTime(400);

    expect(mockFazendaService.buscarPorNome).toHaveBeenCalledWith('bo');
    expect(component.fazendas).toEqual([{ id: 1, nome: 'Fazenda Boa Vista' }] as any);
    expect(component.buscaFeita).toBe(true);
  });

  it('selecionar() emite a fazenda escolhida', () => {
    component.selecionar({ id: 1, nome: 'Fazenda Boa Vista' });
    expect(mockSubformService.emitir).toHaveBeenCalledWith('fazenda', { id: 1, nome: 'Fazenda Boa Vista' });
  });

  it('toggleCadastro() alterna a exibição do formulário de cadastro rápido', () => {
    expect(component.mostrarCadastro).toBe(false);
    component.toggleCadastro();
    expect(component.mostrarCadastro).toBe(true);
  });
});
