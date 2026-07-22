import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DefaultLayoutComponent } from './default-layout.component';
import { AuthService } from '../../core/services/auth.service';

describe('DefaultLayoutComponent', () => {
  let component: DefaultLayoutComponent;
  let fixture: ComponentFixture<DefaultLayoutComponent>;
  let mockAuth: any;

  function setup() {
    TestBed.configureTestingModule({
      imports: [DefaultLayoutComponent],
      providers: [provideRouter([]), provideNoopAnimations(), { provide: AuthService, useValue: mockAuth }],
    }).compileComponents();
    fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
  }

  it('usuários de manejo recebem o nav restrito a lotes/configurações', () => {
    mockAuth = {
      isManejo: () => true, isAdmin: () => false, hasPermission: () => false, getPermissoes: () => [],
      getUserNome: () => 'Ana', getUserTipo: () => 'FUNCIONARIO',
    };
    setup();
    fixture.detectChanges();

    const nomes = component.filteredNavItems.map(i => i.name);
    expect(nomes).toEqual(['Movimentação', 'Lotes', 'Sistema', 'Configurações']);
  });

  it('admins veem todos os itens do nav, incluindo os exclusivos de administração', () => {
    mockAuth = {
      isManejo: () => false, isAdmin: () => true, hasPermission: () => true, getPermissoes: () => [],
      getUserNome: () => 'Ana', getUserTipo: () => 'ADMIN',
    };
    setup();
    fixture.detectChanges();

    const nomes = component.filteredNavItems.map(i => i.name);
    expect(nomes).toContain('Permissões');
    expect(nomes).toContain('Clientes');
    expect(nomes).toContain('WhatsApp');
  });

  it('usuários sem permissão nenhuma só veem itens sem restrição de ambiente', () => {
    mockAuth = {
      isManejo: () => false, isAdmin: () => false, hasPermission: () => false, getPermissoes: () => [],
      getUserNome: () => 'Ana', getUserTipo: () => 'FUNCIONARIO',
    };
    setup();
    fixture.detectChanges();

    const nomes = component.filteredNavItems.map(i => i.name);
    expect(nomes).toEqual(['Relatórios', 'Relatórios', 'Catálogos', 'Catálogo', 'Sistema', 'Configurações']);
  });

  it('usuários com permissão só em CLIENTES:VISUALIZAR veem o item Clientes e seu título de seção', () => {
    mockAuth = {
      isManejo: () => false,
      isAdmin: () => false,
      hasPermission: (ambiente: string, acao: string) => ambiente === 'CLIENTES' && acao === 'VISUALIZAR',
      getPermissoes: () => ['CLIENTES:VISUALIZAR'],
      getUserNome: () => 'Ana', getUserTipo: () => 'FUNCIONARIO',
    };
    setup();
    fixture.detectChanges();

    const nomes = component.filteredNavItems.map(i => i.name);
    expect(nomes).toEqual(['Núcleo de Negócio', 'Clientes', 'Relatórios', 'Relatórios', 'Catálogos', 'Catálogo', 'Sistema', 'Configurações']);
  });
});
