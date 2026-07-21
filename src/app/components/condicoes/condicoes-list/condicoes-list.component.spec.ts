import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CondicoesListComponent } from './condicoes-list.component';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('CondicoesListComponent', () => {
  let component: CondicoesListComponent;
  let fixture: ComponentFixture<CondicoesListComponent>;
  let mockService: any;
  let mockAlert: any;

  const condicoesMock = [{ id: 1, descricao: 'À vista' }] as any;

  beforeEach(async () => {
    mockService = { listar: vi.fn().mockReturnValue(of(condicoesMock)), deletar: vi.fn().mockReturnValue(of(undefined)) };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };

    await TestBed.configureTestingModule({
      imports: [CondicoesListComponent],
      providers: [
        provideRouter([]),
        { provide: CondicoesService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CondicoesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega as condições do service', () => {
    expect(mockService.listar).toHaveBeenCalled();
    expect(component.condicoes$.value).toEqual(condicoesMock);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockService.listar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('abrirDrawerNovo()/abrirDrawerEditar()/fecharDrawer() controlam o estado do drawer', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);

    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);

    component.abrirDrawerEditar(4);
    expect(component.drawerCondicaoId).toBe(4);
  });

  it('onCondicaoSalva() fecha o drawer e recarrega a lista', () => {
    component.abrirDrawerNovo();
    mockService.listar.mockClear();
    component.onCondicaoSalva();
    expect(component.drawerAberto).toBe(false);
    expect(mockService.listar).toHaveBeenCalled();
  });

  it('deletar() exclui e recarrega a lista quando confirmado', () => {
    mockService.listar.mockClear();
    component.deletar(1);
    expect(mockService.deletar).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Condição excluída!');
    expect(mockService.listar).toHaveBeenCalled();
  });
});
