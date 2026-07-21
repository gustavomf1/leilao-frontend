import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { ClientePickerComponent } from './cliente-picker.component';
import { ClienteService } from '../../../core/services/cliente.service';
import { SubformService } from '../../services/subform.service';

describe('ClientePickerComponent', () => {
  let component: ClientePickerComponent;
  let fixture: ComponentFixture<ClientePickerComponent>;
  let mockClienteService: any;
  let mockSubformService: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    mockClienteService = { buscarPorNome: vi.fn().mockReturnValue(of([{ id: 1, nome: 'João' }])) };
    mockSubformService = { emitir: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ClientePickerComponent],
      providers: [
        { provide: ClienteService, useValue: mockClienteService },
        { provide: SubformService, useValue: mockSubformService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('onBusca() não pesquisa com menos de 2 caracteres e limpa os resultados', () => {
    component.clientes = [{ id: 9 }] as any;
    component.busca = 'a';

    component.onBusca();

    expect(component.clientes).toEqual([]);
    expect(component.buscaFeita).toBe(false);
    expect(mockClienteService.buscarPorNome).not.toHaveBeenCalled();
  });

  it('onBusca() pesquisa após o debounce quando há 2+ caracteres', () => {
    component.busca = 'jo';
    component.onBusca();
    vi.advanceTimersByTime(400);

    expect(mockClienteService.buscarPorNome).toHaveBeenCalledWith('jo');
    expect(component.clientes).toEqual([{ id: 1, nome: 'João' }] as any);
    expect(component.buscaFeita).toBe(true);
    expect(component.carregando).toBe(false);
  });

  it('selecionar() emite o cliente escolhido como "titular"', () => {
    component.selecionar({ id: 1, nome: 'João' });
    expect(mockSubformService.emitir).toHaveBeenCalledWith('titular', { id: 1, nome: 'João' });
  });

  it('toggleCadastro() alterna a exibição do formulário de cadastro rápido', () => {
    expect(component.mostrarCadastro).toBe(false);
    component.toggleCadastro();
    expect(component.mostrarCadastro).toBe(true);
  });
});
