import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { FuncionariosListComponent } from './funcionario-list.component';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { PixService } from '../../../core/services/pix.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('FuncionariosListComponent', () => {
  let component: FuncionariosListComponent;
  let fixture: ComponentFixture<FuncionariosListComponent>;
  let mockFuncionarioService: any;
  let mockPixService: any;
  let mockAlert: any;

  const funcionariosMock = [{ id: 1, nome: 'Carlos' }, { id: 2, nome: 'Ana' }] as any;

  beforeEach(async () => {
    mockFuncionarioService = {
      listar: vi.fn().mockReturnValue(of(funcionariosMock)),
      deletar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockPixService = {
      listarPorUsuario: vi.fn().mockReturnValue(of([{ pixId: 1, tipo: 'EMAIL', chave: 'a@a.com' }] as any)),
      cadastrar: vi.fn().mockReturnValue(of({})),
      deletar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };

    await TestBed.configureTestingModule({
      imports: [FuncionariosListComponent],
      providers: [
        provideRouter([]),
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: PixService, useValue: mockPixService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionariosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega os funcionários do service', () => {
    expect(mockFuncionarioService.listar).toHaveBeenCalled();
    expect(component.funcionarios$.value).toEqual(funcionariosMock);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockFuncionarioService.listar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('abrirDrawerNovo()/abrirDrawerEditar()/fecharDrawer() controlam o estado do drawer', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);

    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);

    component.abrirDrawerEditar(3);
    expect(component.drawerFuncionarioId).toBe(3);
  });

  it('onFuncionarioSalvo() fecha o drawer e recarrega a lista', () => {
    component.abrirDrawerNovo();
    mockFuncionarioService.listar.mockClear();
    component.onFuncionarioSalvo();
    expect(component.drawerAberto).toBe(false);
    expect(mockFuncionarioService.listar).toHaveBeenCalled();
  });

  it('deletar() remove o funcionário da lista localmente quando confirmado', () => {
    component.deletar(1);
    expect(mockFuncionarioService.deletar).toHaveBeenCalledWith(1);
    expect(component.funcionarios$.value.find((f: any) => f.id === 1)).toBeUndefined();
    expect(mockAlert.success).toHaveBeenCalledWith('Funcionário excluído!');
  });

  it('abrirModalPix() carrega as chaves pix do funcionário', () => {
    component.abrirModalPix({ id: 2, nome: 'Ana' } as any);
    expect(mockPixService.listarPorUsuario).toHaveBeenCalledWith(2);
    expect(component.pixKeys).toEqual([{ pixId: 1, tipo: 'EMAIL', chave: 'a@a.com' }] as any);
    expect(component.modalPixVisivel).toBe(true);
  });

  it('fecharModalPix() limpa a seleção', () => {
    component.abrirModalPix({ id: 2 } as any);
    component.fecharModalPix();
    expect(component.modalPixVisivel).toBe(false);
    expect(component.funcionarioSelecionado).toBeNull();
  });

  it('adicionarPix() rejeita chave vazia', () => {
    component.abrirModalPix({ id: 2 } as any);
    component.novoPix = { tipo: 'EMAIL', chave: '' };
    component.adicionarPix();
    expect(mockAlert.error).toHaveBeenCalledWith('Informe a chave Pix');
    expect(mockPixService.cadastrar).not.toHaveBeenCalled();
  });

  it('adicionarPix() cadastra e recarrega as chaves', () => {
    component.abrirModalPix({ id: 2 } as any);
    component.novoPix = { tipo: 'EMAIL', chave: 'nova@a.com' };
    component.adicionarPix();
    expect(mockPixService.cadastrar).toHaveBeenCalledWith({ tipo: 'EMAIL', chave: 'nova@a.com', usuarioId: 2 } as any);
    expect(mockAlert.success).toHaveBeenCalledWith('Chave Pix adicionada!');
  });

  it('deletarPix() remove a chave da lista quando confirmado', () => {
    component.abrirModalPix({ id: 2 } as any);
    component.deletarPix(1);
    expect(mockPixService.deletar).toHaveBeenCalledWith(1);
    expect(component.pixKeys).toEqual([]);
  });
});
