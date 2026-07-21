import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ConfirmModalComponent } from './confirm-modal.component';
import { AlertService } from '../services/alert.service';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let alertService: AlertService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    alertService = TestBed.inject(AlertService);
    fixture.detectChanges();
  });

  it('exibe o modal com a mensagem e os labels emitidos pelo AlertService', () => {
    alertService.confirm('Excluir tudo?', () => {}, 'Confirmar', 'success');

    expect(component.visible).toBe(true);
    expect(component.message).toBe('Excluir tudo?');
    expect(component.confirmLabel).toBe('Confirmar');
    expect(component.confirmColor).toBe('success');
  });

  it('usa os labels padrão quando não informados', () => {
    alertService.confirm('Excluir?', () => {});
    expect(component.confirmLabel).toBe('Excluir');
    expect(component.confirmColor).toBe('danger');
  });

  it('confirmar() executa o callback e fecha o modal', () => {
    const callback = vi.fn();
    alertService.confirm('Excluir?', callback);

    component.confirmar();

    expect(callback).toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });

  it('cancelar() fecha o modal sem executar o callback', () => {
    const callback = vi.fn();
    alertService.confirm('Excluir?', callback);

    component.cancelar();

    expect(callback).not.toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });
});
