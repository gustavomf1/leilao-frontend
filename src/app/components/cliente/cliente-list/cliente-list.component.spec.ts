import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ClientesListComponent } from './cliente-list.component';
import { ClienteService } from '../../../core/services/cliente.service';
import { PixService } from '../../../core/services/pix.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('ClientesListComponent', () => {
  let component: ClientesListComponent;
  let fixture: ComponentFixture<ClientesListComponent>;
  let mockClienteService: any;
  let mockPixService: any;
  let mockAlert: any;

  const paginaMock = { content: [{ id: 1, nome: 'João' }], totalPages: 3, totalElements: 45 } as any;

  beforeEach(async () => {
    mockClienteService = {
      listarPaginado: vi.fn().mockReturnValue(of(paginaMock)),
      deletar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockPixService = {
      listarPorUsuario: vi.fn().mockReturnValue(of([{ pixId: 1, tipo: 'CPF_CNPJ', chave: '123' }] as any)),
      cadastrar: vi.fn().mockReturnValue(of({})),
      deletar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };

    await TestBed.configureTestingModule({
      imports: [ClientesListComponent],
      providers: [
        provideRouter([]),
        { provide: ClienteService, useValue: mockClienteService },
        { provide: PixService, useValue: mockPixService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega a página inicial de clientes', () => {
    expect(mockClienteService.listarPaginado).toHaveBeenCalledWith(0, 20, undefined);
    expect(component.totalPaginas).toBe(3);
    expect(component.totalElementos).toBe(45);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockClienteService.listarPaginado.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('onBuscaMudou() reseta a página e recarrega com o termo de busca', () => {
    mockClienteService.listarPaginado.mockClear();
    component.onBuscaMudou('maria');
    expect(component.paginaAtual).toBe(0);
    expect(mockClienteService.listarPaginado).toHaveBeenCalledWith(0, 20, 'maria');
  });

  it('onTamanhoMudou() reseta a página e recarrega com o novo tamanho', () => {
    component.paginaAtual = 2;
    mockClienteService.listarPaginado.mockClear();
    component.onTamanhoMudou(50);
    expect(component.paginaAtual).toBe(0);
    expect(mockClienteService.listarPaginado).toHaveBeenCalledWith(0, 50, undefined);
  });

  it('onPaginaMudou() recarrega na página informada', () => {
    mockClienteService.listarPaginado.mockClear();
    component.onPaginaMudou(1);
    expect(mockClienteService.listarPaginado).toHaveBeenCalledWith(1, 20, undefined);
  });

  it('abrirDrawerNovo()/abrirDrawerEditar()/fecharDrawer() controlam o estado do drawer e o scroll do body', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);
    expect(component.drawerClienteId).toBeUndefined();
    expect(document.body.style.overflow).toBe('hidden');

    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);
    expect(document.body.style.overflow).toBe('');

    component.abrirDrawerEditar(7);
    expect(component.drawerClienteId).toBe(7);
    expect(component.drawerAberto).toBe(true);
  });

  it('onEsc() fecha o drawer apenas quando está aberto', () => {
    component.onEsc();
    expect(component.drawerAberto).toBe(false);

    component.abrirDrawerNovo();
    component.onEsc();
    expect(component.drawerAberto).toBe(false);
  });

  it('onClienteSalvo() fecha o drawer e recarrega a lista', () => {
    component.abrirDrawerNovo();
    mockClienteService.listarPaginado.mockClear();

    component.onClienteSalvo();

    expect(component.drawerAberto).toBe(false);
    expect(mockClienteService.listarPaginado).toHaveBeenCalled();
  });

  it('deletar() exclui o cliente e recarrega a lista quando confirmado', () => {
    mockClienteService.listarPaginado.mockClear();
    component.deletar(1);
    expect(mockClienteService.deletar).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Cliente excluído!');
    expect(mockClienteService.listarPaginado).toHaveBeenCalled();
  });

  it('abrirModalPix() carrega as chaves pix do cliente selecionado', () => {
    component.abrirModalPix({ id: 3, nome: 'Ana' } as any);
    expect(mockPixService.listarPorUsuario).toHaveBeenCalledWith(3);
    expect(component.pixKeys).toEqual([{ pixId: 1, tipo: 'CPF_CNPJ', chave: '123' }] as any);
    expect(component.modalPixVisivel).toBe(true);
  });

  it('fecharModalPix() limpa a seleção', () => {
    component.abrirModalPix({ id: 3, nome: 'Ana' } as any);
    component.fecharModalPix();
    expect(component.modalPixVisivel).toBe(false);
    expect(component.clienteSelecionado).toBeNull();
    expect(component.pixKeys).toEqual([]);
  });

  it('adicionarPix() rejeita chave vazia sem chamar o service', () => {
    component.abrirModalPix({ id: 3 } as any);
    component.novoPix = { tipo: 'CPF_CNPJ', chave: '  ' };

    component.adicionarPix();

    expect(mockAlert.error).toHaveBeenCalledWith('Informe a chave Pix');
    expect(mockPixService.cadastrar).not.toHaveBeenCalled();
  });

  it('adicionarPix() cadastra a chave e recarrega a lista de chaves', () => {
    component.abrirModalPix({ id: 3 } as any);
    component.novoPix = { tipo: 'EMAIL', chave: 'a@a.com' };

    component.adicionarPix();

    expect(mockPixService.cadastrar).toHaveBeenCalledWith({ tipo: 'EMAIL', chave: 'a@a.com', usuarioId: 3 } as any);
    expect(mockAlert.success).toHaveBeenCalledWith('Chave Pix adicionada!');
  });

  it('deletarPix() remove a chave da lista quando confirmado', () => {
    component.abrirModalPix({ id: 3 } as any);

    component.deletarPix(1);

    expect(mockPixService.deletar).toHaveBeenCalledWith(1);
    expect(component.pixKeys).toEqual([]);
    expect(mockAlert.success).toHaveBeenCalledWith('Chave removida!');
  });
});
