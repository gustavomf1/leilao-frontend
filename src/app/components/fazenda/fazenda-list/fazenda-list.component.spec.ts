import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { FazendasListComponent } from './fazenda-list.component';
import { FazendaService } from '../../../core/services/fazenda.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('FazendasListComponent', () => {
  let component: FazendasListComponent;
  let fixture: ComponentFixture<FazendasListComponent>;
  let mockFazendaService: any;
  let mockAlert: any;

  const paginaMock = { content: [{ id: 1, nome: 'Fazenda Boa Vista' }], totalPages: 2, totalElements: 30 } as any;

  beforeEach(async () => {
    mockFazendaService = {
      listarPaginado: vi.fn().mockReturnValue(of(paginaMock)),
      deletar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };

    await TestBed.configureTestingModule({
      imports: [FazendasListComponent],
      providers: [
        provideRouter([]),
        { provide: FazendaService, useValue: mockFazendaService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FazendasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega a página inicial de fazendas', () => {
    expect(mockFazendaService.listarPaginado).toHaveBeenCalledWith(0, 20, undefined);
    expect(component.totalPaginas).toBe(2);
    expect(component.totalElementos).toBe(30);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockFazendaService.listarPaginado.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('onBuscaMudou()/onTamanhoMudou()/onPaginaMudou() recarregam com os parâmetros corretos', () => {
    mockFazendaService.listarPaginado.mockClear();
    component.onBuscaMudou('vista');
    expect(mockFazendaService.listarPaginado).toHaveBeenCalledWith(0, 20, 'vista');

    mockFazendaService.listarPaginado.mockClear();
    component.onTamanhoMudou(50);
    expect(mockFazendaService.listarPaginado).toHaveBeenCalledWith(0, 50, 'vista');

    mockFazendaService.listarPaginado.mockClear();
    component.onPaginaMudou(1);
    expect(mockFazendaService.listarPaginado).toHaveBeenCalledWith(1, 50, 'vista');
  });

  it('abrirDrawerNovo()/abrirDrawerEditar()/fecharDrawer() controlam o estado do drawer', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);
    expect(component.drawerFazendaId).toBeUndefined();

    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);

    component.abrirDrawerEditar(9);
    expect(component.drawerFazendaId).toBe(9);
  });

  it('onFazendaSalva() fecha o drawer e recarrega a lista', () => {
    component.abrirDrawerNovo();
    mockFazendaService.listarPaginado.mockClear();

    component.onFazendaSalva();

    expect(component.drawerAberto).toBe(false);
    expect(mockFazendaService.listarPaginado).toHaveBeenCalled();
  });

  it('deletar() exclui a fazenda e recarrega a lista quando confirmado', () => {
    mockFazendaService.listarPaginado.mockClear();
    component.deletar(1);
    expect(mockFazendaService.deletar).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Fazenda excluída!');
    expect(mockFazendaService.listarPaginado).toHaveBeenCalled();
  });
});
