import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { AdminRolesComponent } from './admin-roles.component';
import { RoleService } from '../../core/services/role.service';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { AlertService } from '../../shared/services/alert.service';

describe('AdminRolesComponent', () => {
  let component: AdminRolesComponent;
  let fixture: ComponentFixture<AdminRolesComponent>;
  let mockRoleService: any;
  let mockFuncionarioService: any;
  let mockAlert: any;

  const rolesMock = [{ id: 1, nome: 'GERENTE', descricao: 'Gerente', permissoes: [{ ambiente: 'LOTES', acao: 'EDITAR' }] }] as any;
  const funcionariosMock = [{ id: 5, nome: 'Ana', isAdmin: false, roles: [{ id: 1, nome: 'GERENTE' }] }] as any;

  beforeEach(async () => {
    mockRoleService = {
      listar: vi.fn().mockReturnValue(of(rolesMock)),
      criar: vi.fn().mockReturnValue(of({})),
      atualizar: vi.fn().mockReturnValue(of({})),
      deletar: vi.fn().mockReturnValue(of(undefined)),
      atribuirRoles: vi.fn().mockReturnValue(of({})),
    };
    mockFuncionarioService = { listar: vi.fn().mockReturnValue(of(funcionariosMock)) };
    mockAlert = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AdminRolesComponent],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega roles e funcionários', () => {
    expect(mockRoleService.listar).toHaveBeenCalled();
    expect(mockFuncionarioService.listar).toHaveBeenCalled();
    expect(component.roles).toEqual(rolesMock);
    expect(component.funcionarios).toEqual(funcionariosMock);
  });

  it('carregarRoles()/carregarFuncionarios() mostram alerta de erro quando falham', () => {
    mockRoleService.listar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou roles' } })));
    component.carregarRoles();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou roles');

    mockFuncionarioService.listar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou func' } })));
    component.carregarFuncionarios();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou func');
  });

  it('salvarRole() rejeita nome vazio sem chamar o service', () => {
    component.novaRole = { nome: '  ', descricao: '' };
    component.salvarRole();
    expect(mockAlert.error).toHaveBeenCalledWith('Nome da role é obrigatório');
    expect(mockRoleService.criar).not.toHaveBeenCalled();
  });

  it('salvarRole() cria uma nova role incluindo as permissões da matrix', () => {
    component.novaRole = { nome: 'NOVA', descricao: 'desc' };
    component.permissaoMatrix[component.ambientes[0]][component.acoes[0]] = true;

    component.salvarRole();

    expect(mockRoleService.criar).toHaveBeenCalled();
    const enviado = mockRoleService.criar.mock.calls[0][0];
    const contemPermissao = enviado.permissoes.some(
      (p: any) => p.ambiente === component.ambientes[0] && p.acao === component.acoes[0]
    );
    expect(contemPermissao).toBe(true);
    expect(mockAlert.success).toHaveBeenCalledWith('Role criada!');
  });

  it('editarRole() preenche o form e a matrix a partir da role existente', () => {
    component.editarRole(rolesMock[0]);
    expect(component.editandoRole).toEqual(rolesMock[0]);
    expect(component.novaRole.nome).toBe('GERENTE');
    expect(component.permissaoMatrix['LOTES']['EDITAR']).toBe(true);
  });

  it('salvarRole() em edição chama atualizar() com o id', () => {
    component.editarRole(rolesMock[0]);
    component.salvarRole();
    expect(mockRoleService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockRoleService.atualizar.mock.calls[0][1].nome).toBe('GERENTE');
    expect(mockAlert.success).toHaveBeenCalledWith('Role atualizada!');
  });

  it('limparFormRole() reseta o form e a matrix', () => {
    component.editarRole(rolesMock[0]);
    component.limparFormRole();
    expect(component.editandoRole).toBeNull();
    expect(component.novaRole).toEqual({ nome: '', descricao: '' });
    expect(component.permissaoMatrix['LOTES']['EDITAR']).toBe(false);
  });

  it('deletarRole() exclui quando confirmado pelo confirm nativo', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.deletarRole(1);
    expect(mockRoleService.deletar).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Role excluída!');
  });

  it('deletarRole() não exclui quando cancelado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deletarRole(1);
    expect(mockRoleService.deletar).not.toHaveBeenCalled();
  });

  it('abrirModalRoles()/fecharModal() controlam a seleção do funcionário e suas roles', () => {
    component.abrirModalRoles(funcionariosMock[0]);
    expect(component.modalVisivel).toBe(true);
    expect(component.rolesSelecionadas.has(1)).toBe(true);

    component.fecharModal();
    expect(component.modalVisivel).toBe(false);
    expect(component.funcionarioSelecionado).toBeNull();
  });

  it('toggleRole() adiciona e remove roles do set selecionado', () => {
    component.toggleRole(2);
    expect(component.rolesSelecionadas.has(2)).toBe(true);
    component.toggleRole(2);
    expect(component.rolesSelecionadas.has(2)).toBe(false);
  });

  it('salvarRolesFuncionario() envia o dto e recarrega os funcionários', () => {
    component.abrirModalRoles(funcionariosMock[0]);
    component.isAdminSelecionado = true;

    component.salvarRolesFuncionario();

    expect(mockRoleService.atribuirRoles).toHaveBeenCalledWith(5, { roleIds: [1], isAdmin: true });
    expect(mockAlert.success).toHaveBeenCalledWith('Permissões atualizadas!');
    expect(component.modalVisivel).toBe(false);
  });

  it('getRolesDoFuncionario() lista os nomes ou retorna "Nenhuma"', () => {
    expect(component.getRolesDoFuncionario(funcionariosMock[0])).toBe('GERENTE');
    expect(component.getRolesDoFuncionario({ id: 9, nome: 'X', roles: [] } as any)).toBe('Nenhuma');
  });

  it('toggleAllAmbiente() liga tudo se nada estiver marcado, e desliga se tudo estiver marcado', () => {
    const ambiente = component.ambientes[0];
    component.toggleAllAmbiente(ambiente);
    expect(component.acoes.every(a => component.permissaoMatrix[ambiente][a])).toBe(true);

    component.toggleAllAmbiente(ambiente);
    expect(component.acoes.every(a => !component.permissaoMatrix[ambiente][a])).toBe(true);
  });

  it('toggleAllAcao() liga/desliga a mesma ação em todos os ambientes', () => {
    const acao = component.acoes[0];
    component.toggleAllAcao(acao);
    expect(component.ambientes.every(a => component.permissaoMatrix[a][acao])).toBe(true);

    component.toggleAllAcao(acao);
    expect(component.ambientes.every(a => !component.permissaoMatrix[a][acao])).toBe(true);
  });
});
