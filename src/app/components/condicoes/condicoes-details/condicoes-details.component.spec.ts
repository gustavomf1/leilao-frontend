import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { CondicoesDetailsComponent } from './condicoes-details.component';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('CondicoesDetailsComponent', () => {
  let component: CondicoesDetailsComponent;
  let fixture: ComponentFixture<CondicoesDetailsComponent>;
  let mockService: any;
  let mockAlert: any;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [CondicoesDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: CondicoesService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;
    fixture = TestBed.createComponent(CondicoesDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    paramId = null;
    mockService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, descricao: 'À vista' } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
      atualizar: vi.fn().mockReturnValue(of({ id: 1 } as any)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
  });

  it('em modo de edição, carrega a condição', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    expect(component.isEdicao).toBe(true);
    expect(component.form.get('descricao')?.value).toBe('À vista');
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockService.buscarPorId.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('salvar() com form inválido não chama o service', () => {
    setup();
    fixture.detectChanges();
    component.salvar();
    expect(mockService.salvar).not.toHaveBeenCalled();
  });

  it('salvar() em modo de criação chama service.salvar() e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    component.form.patchValue({ descricao: 'À prazo' });

    component.salvar();

    expect(mockService.salvar).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalledWith('Condição cadastrada!');
    expect(navigateSpy).toHaveBeenCalledWith(['/condicoes/lista']);
  });

  it('salvar() em modo de edição chama service.atualizar() com o id', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    component.form.patchValue({ descricao: 'Editada' });

    component.salvar();

    expect(mockService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Condição atualizada!');
  });

  it('salvar() em modoDrawer emite aoSalvar em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoDrawer = true;
    const emitSpy = vi.fn();
    component.aoSalvar.subscribe(emitSpy);
    component.form.patchValue({ descricao: 'À prazo' });

    component.salvar();

    expect(emitSpy).toHaveBeenCalledWith({ id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    component.form.patchValue({ descricao: 'À prazo' });

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
