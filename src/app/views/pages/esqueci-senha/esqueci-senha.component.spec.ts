import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { EsqueciSenhaComponent } from './esqueci-senha.component';
import { RecuperacaoSenhaService } from '../../../core/services/recuperacao-senha.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('EsqueciSenhaComponent', () => {
  let component: EsqueciSenhaComponent;
  let fixture: ComponentFixture<EsqueciSenhaComponent>;
  let mockService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockService = { solicitar: vi.fn().mockReturnValue(of({})) };
    mockAlert = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EsqueciSenhaComponent],
      providers: [
        provideRouter([]),
        { provide: RecuperacaoSenhaService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueciSenhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('onSubmit() com e-mail inválido marca os campos como touched e não chama o service', () => {
    component.onSubmit();
    expect(component.form.get('email')?.touched).toBe(true);
    expect(mockService.solicitar).not.toHaveBeenCalled();
  });

  it('onSubmit() solicita a recuperação e marca como enviado', () => {
    component.form.setValue({ email: 'ana@a.com' });

    component.onSubmit();

    expect(mockService.solicitar).toHaveBeenCalledWith('ana@a.com');
    expect(component.enviado()).toBe(true);
    expect(component.emailEnviado()).toBe('ana@a.com');
    expect(component.loading()).toBe(false);
  });

  it('onSubmit() mostra alerta de erro quando falha', () => {
    mockService.solicitar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.form.setValue({ email: 'ana@a.com' });

    component.onSubmit();

    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
    expect(component.loading()).toBe(false);
  });

  it('reenviar() reenvia para o e-mail já enviado e mostra sucesso', () => {
    component.form.setValue({ email: 'ana@a.com' });
    component.onSubmit();
    mockService.solicitar.mockClear();

    component.reenviar();

    expect(mockService.solicitar).toHaveBeenCalledWith('ana@a.com');
    expect(mockAlert.success).toHaveBeenCalledWith('E-mail reenviado para ana@a.com');
    expect(component.reenviando()).toBe(false);
  });

  it('reenviar() não faz nada se já está reenviando', () => {
    component.form.setValue({ email: 'ana@a.com' });
    component.onSubmit();
    component.reenviando.set(true);
    mockService.solicitar.mockClear();

    component.reenviar();

    expect(mockService.solicitar).not.toHaveBeenCalled();
  });

  it('reenviar() mostra alerta de erro quando falha', () => {
    component.form.setValue({ email: 'ana@a.com' });
    component.onSubmit();
    mockService.solicitar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou reenvio' } })));

    component.reenviar();

    expect(mockAlert.error).toHaveBeenCalledWith('falhou reenvio');
    expect(component.reenviando()).toBe(false);
  });
});
