import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TableModule, TableDirective,
  CardBodyComponent, CardComponent, CardHeaderComponent,
  ButtonDirective, FormModule, GridModule,
  BadgeComponent, ModalModule
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faShieldHalved, faSave, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { Role, Funcionario, AtribuirRoles } from '../../core/models/entities.model';
import { RoleService } from '../../core/services/role.service';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, TableDirective,
    CardBodyComponent, CardComponent, CardHeaderComponent,
    ButtonDirective, FormModule, GridModule,
    BadgeComponent, ModalModule,
    FontAwesomeModule
  ],
  templateUrl: './admin-roles.component.html'
})
export class AdminRolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private funcionarioService = inject(FuncionarioService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faShieldHalved = faShieldHalved;
  faSave = faSave;
  faUserShield = faUserShield;

  roles: Role[] = [];
  funcionarios: Funcionario[] = [];

  // Role form
  novaRole: Role = { nome: '', descricao: '' };
  editandoRole: Role | null = null;

  // Funcionario roles modal
  funcionarioSelecionado: Funcionario | null = null;
  rolesSelecionadas: Set<number> = new Set();
  isAdminSelecionado = false;
  modalVisivel = false;

  ngOnInit() {
    this.carregarRoles();
    this.carregarFuncionarios();
  }

  carregarRoles() {
    this.roleService.listar().subscribe({
      next: (data) => { this.roles = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar roles')
    });
  }

  carregarFuncionarios() {
    this.funcionarioService.listar().subscribe({
      next: (data) => { this.funcionarios = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar funcionários')
    });
  }

  salvarRole() {
    if (!this.novaRole.nome.trim()) {
      this.alert.error('Nome da role é obrigatório');
      return;
    }

    if (this.editandoRole?.id) {
      this.roleService.atualizar(this.editandoRole.id, this.novaRole).subscribe({
        next: () => {
          this.alert.success('Role atualizada!');
          this.limparFormRole();
          this.carregarRoles();
        },
        error: () => this.alert.error('Erro ao atualizar role')
      });
    } else {
      this.roleService.criar(this.novaRole).subscribe({
        next: () => {
          this.alert.success('Role criada!');
          this.limparFormRole();
          this.carregarRoles();
        },
        error: () => this.alert.error('Erro ao criar role')
      });
    }
  }

  editarRole(role: Role) {
    this.editandoRole = role;
    this.novaRole = { nome: role.nome, descricao: role.descricao };
  }

  deletarRole(id: number) {
    if (confirm('Deseja realmente excluir esta role?')) {
      this.roleService.deletar(id).subscribe({
        next: () => { this.alert.success('Role excluída!'); this.carregarRoles(); },
        error: () => this.alert.error('Erro ao excluir role')
      });
    }
  }

  limparFormRole() {
    this.novaRole = { nome: '', descricao: '' };
    this.editandoRole = null;
  }

  abrirModalRoles(funcionario: Funcionario) {
    this.funcionarioSelecionado = funcionario;
    this.isAdminSelecionado = funcionario.isAdmin ?? false;
    this.rolesSelecionadas = new Set(
      (funcionario.roles ?? []).map(r => r.id!).filter(id => id != null)
    );
    this.modalVisivel = true;
  }

  fecharModal() {
    this.modalVisivel = false;
    this.funcionarioSelecionado = null;
  }

  toggleRole(roleId: number) {
    if (this.rolesSelecionadas.has(roleId)) {
      this.rolesSelecionadas.delete(roleId);
    } else {
      this.rolesSelecionadas.add(roleId);
    }
  }

  salvarRolesFuncionario() {
    if (!this.funcionarioSelecionado?.id) return;

    const dto: AtribuirRoles = {
      roleIds: Array.from(this.rolesSelecionadas),
      isAdmin: this.isAdminSelecionado
    };

    this.roleService.atribuirRoles(this.funcionarioSelecionado.id, dto).subscribe({
      next: () => {
        this.alert.success('Permissões atualizadas!');
        this.fecharModal();
        this.carregarFuncionarios();
      },
      error: () => this.alert.error('Erro ao atualizar permissões')
    });
  }

  getRolesDoFuncionario(funcionario: Funcionario): string {
    if (!funcionario.roles || funcionario.roles.length === 0) return 'Nenhuma';
    return funcionario.roles.map(r => r.nome).join(', ');
  }
}
