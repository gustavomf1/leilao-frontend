import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { RedefinirSenhaComponent } from './redefinir-senha.component';
import { RecuperacaoSenhaService } from '../../../core/services/recuperacao-senha.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('RedefinirSenhaComponent', () => {
  let component: RedefinirSenhaComponent;
  let fixture: ComponentFixture<RedefinirSenhaComponent>;
  let mockService: any;
  let mockAlert: any;
  let queryParamMapSubject: Subject<any>;
  let navigateSpy: ReturnType<typeof vi.fn>;

  function setup() {
    TestBed.configureTestingModule({
      imports: [RedefinirSenhaComponent],
      providers: [
        provideRouter([]),
        { provide: RecuperacaoSenhaService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamMapSubject.asObservable() } },
      ],
    }).compileComponents();
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;
    fixture = TestBed.createComponent(RedefinirSenhaComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    queryParamMapSubject = new Subject();
    mockService = {
      validar: vi.fn().mockReturnValue(of('ok')),
      redefinir: vi.fn().mockReturnValue(of({})),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
  });

  it('sem token na query, redireciona para /login', () => {
    setup();
    fixture.detectChanges();
    queryParamMapSubject.next(convertToParamMap({}));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(mockService.validar).not.toHaveBeenCalled();
  });

  it('com token válido, valida e libera o formulário', () => {
    setup();
    fixture.detectChanges();
    queryParamMapSubject.next(convertToParamMap({ token: 'tok123' }));

    expect(mockService.validar).toHaveBeenCalledWith('tok123');
    expect(component.validando()).toBe(false);
    expect(component.tokenInvalido()).toBe(false);
  });

  it('com token inválido, marca tokenInvalido e extrai a mensagem de erro', () => {
    mockService.validar.mockReturnValue(throwError(() => ({ error: JSON.stringify({ mensagem: 'Token expirado' }) })));
    setup();
    fixture.detectChanges();
    queryParamMapSubject.next(convertToParamMap({ token: 'tok123' }));

    expect(component.tokenInvalido()).toBe(true);
    expect(component.tokenErro()).toBe('Token expirado');
  });

  it('togglePasswordVisibility()/toggleConfirmPasswordVisibility() alternam os sinais', () => {
    setup();
    fixture.detectChanges();

    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);

    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword()).toBe(true);
  });

  it('o form é inválido quando as senhas não coincidem', () => {
    setup();
    fixture.detectChanges();
    component.form.setValue({ novaSenha: 'abc123', confirmarSenha: 'diferente' });
    expect(component.form.hasError('senhasDiferentes')).toBe(true);
  });

  it('onSubmit() com form inválido não chama o service', () => {
    setup();
    fixture.detectChanges();
    component.onSubmit();
    expect(mockService.redefinir).not.toHaveBeenCalled();
  });

  it('onSubmit() redefine a senha e marca como concluído', () => {
    setup();
    fixture.detectChanges();
    queryParamMapSubject.next(convertToParamMap({ token: 'tok123' }));
    component.form.setValue({ novaSenha: 'abc123', confirmarSenha: 'abc123' });

    component.onSubmit();

    expect(mockService.redefinir).toHaveBeenCalledWith('tok123', 'abc123');
    expect(component.concluido()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('onSubmit() mostra alerta de erro quando falha', () => {
    setup();
    fixture.detectChanges();
    queryParamMapSubject.next(convertToParamMap({ token: 'tok123' }));
    mockService.redefinir.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.form.setValue({ novaSenha: 'abc123', confirmarSenha: 'abc123' });

    component.onSubmit();

    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
    expect(component.loading()).toBe(false);
  });
});
