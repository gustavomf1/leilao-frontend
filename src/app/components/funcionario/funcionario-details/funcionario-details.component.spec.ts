import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { FuncionariosDetailsComponent } from './funcionario-details.component';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('FuncionariosDetailsComponent', () => {
  let component: FuncionariosDetailsComponent;
  let fixture: ComponentFixture<FuncionariosDetailsComponent>;

  let mockFuncionarioService: any;
  let mockAlert: any;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [FuncionariosDetailsComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: AlertService, useValue: mockAlert },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;

    fixture = TestBed.createComponent(FuncionariosDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    paramId = null;
    mockFuncionarioService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, nome: 'Carlos', email: 'c@a.com' } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
      atualizar: vi.fn().mockReturnValue(of({ id: 1 } as any)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
  });

  it('em modo de criação, senha é obrigatória', () => {
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(false);
    component.form.patchValue({ nome: 'X', email: 'x@a.com', cpfCnpj: '123.456.789-00' });
    expect(component.form.valid).toBe(false);
    expect(component.form.get('senha')?.hasError('required')).toBe(true);
  });

  it('em modo de edição, carrega o funcionário e a senha deixa de ser obrigatória', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(true);
    expect(mockFuncionarioService.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.form.get('nome')?.value).toBe('Carlos');
    component.form.patchValue({ senha: '' });
    expect(component.form.get('senha')?.hasError('required')).toBe(false);
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockFuncionarioService.buscarPorId.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('salvar() em modo de criação envia a senha e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    component.form.setValue({ nome: 'Novo', email: 'novo@a.com', cpfCnpj: '123.456.789-00', senha: '123456', isManejo: false });

    component.salvar();

    expect(mockFuncionarioService.salvar).toHaveBeenCalledWith(
      { nome: 'Novo', email: 'novo@a.com', cpfCnpj: '12345678900', senha: '123456', isManejo: false } as any
    );
    expect(mockAlert.success).toHaveBeenCalledWith('Funcionário cadastrado!');
    expect(navigateSpy).toHaveBeenCalledWith(['/funcionarios/lista']);
  });

  it('salvar() em modo de edição sem senha preenchida remove o campo antes de enviar', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Carlos Editado', email: 'c@a.com', cpfCnpj: '123.456.789-00', senha: '', isManejo: true });

    component.salvar();

    expect(mockFuncionarioService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockFuncionarioService.atualizar.mock.calls[0][1].senha).toBeUndefined();
    expect(mockAlert.success).toHaveBeenCalledWith('Funcionário atualizado!');
  });

  it('salvar() em modoDrawer emite aoSalvar em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoDrawer = true;
    const emitSpy = vi.fn();
    component.aoSalvar.subscribe(emitSpy);
    component.form.setValue({ nome: 'Novo', email: 'novo@a.com', cpfCnpj: '123.456.789-00', senha: '123456', isManejo: false });

    component.salvar();

    expect(emitSpy).toHaveBeenCalledWith({ id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockFuncionarioService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    component.form.setValue({ nome: 'Novo', email: 'novo@a.com', cpfCnpj: '123.456.789-00', senha: '123456', isManejo: false });

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
