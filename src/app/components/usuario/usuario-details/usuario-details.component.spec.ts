import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { UsuariosDetailsComponent } from './usuario-details.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('UsuariosDetailsComponent', () => {
  let component: UsuariosDetailsComponent;
  let fixture: ComponentFixture<UsuariosDetailsComponent>;

  let mockUsuarioService: any;
  let mockAlert: any;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [UsuariosDetailsComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: AlertService, useValue: mockAlert },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;

    fixture = TestBed.createComponent(UsuariosDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    paramId = null;
    mockUsuarioService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, nome: 'Ana', email: 'ana@a.com' } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
      atualizar: vi.fn().mockReturnValue(of({ id: 1 } as any)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
  });

  it('em modo de edição, carrega o usuário e mantém a senha como obrigatória', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(true);
    expect(mockUsuarioService.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.form.get('nome')?.value).toBe('Ana');
    expect(component.form.get('senha')?.hasError('required')).toBe(true);
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockUsuarioService.buscarPorId.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('salvar() com form inválido não chama o service', () => {
    setup();
    fixture.detectChanges();
    component.salvar();
    expect(mockUsuarioService.salvar).not.toHaveBeenCalled();
  });

  it('salvar() em modo de criação chama service.salvar() e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    component.form.setValue({ nome: 'Novo', email: 'novo@a.com', senha: '123456', cpfCnpj: '123.456.789-00' });

    component.salvar();

    expect(mockUsuarioService.salvar).toHaveBeenCalledWith(
      { nome: 'Novo', email: 'novo@a.com', senha: '123456', cpfCnpj: '12345678900' } as any
    );
    expect(mockAlert.success).toHaveBeenCalledWith('Usuário cadastrado!');
    expect(navigateSpy).toHaveBeenCalledWith(['/usuarios/lista']);
  });

  it('salvar() em modo de edição chama service.atualizar() com o id', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    component.form.setValue({ nome: 'Ana Editada', email: 'ana@a.com', senha: '123456', cpfCnpj: '123.456.789-00' });

    component.salvar();

    expect(mockUsuarioService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Usuário atualizado!');
  });

  it('salvar() em modoDrawer emite aoSalvar em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoDrawer = true;
    const emitSpy = vi.fn();
    component.aoSalvar.subscribe(emitSpy);
    component.form.setValue({ nome: 'Novo', email: 'novo@a.com', senha: '123456', cpfCnpj: '123.456.789-00' });

    component.salvar();

    expect(emitSpy).toHaveBeenCalledWith({ id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockUsuarioService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    component.form.setValue({ nome: 'Novo', email: 'novo@a.com', senha: '123456', cpfCnpj: '123.456.789-00' });

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
