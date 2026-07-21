import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { TaxasDetailsComponent } from './taxas-details.component';
import { TaxasService } from '../../../core/services/taxas.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('TaxasDetailsComponent', () => {
  let component: TaxasDetailsComponent;
  let fixture: ComponentFixture<TaxasDetailsComponent>;
  let mockService: any;
  let mockAlert: any;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [TaxasDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: TaxasService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;
    fixture = TestBed.createComponent(TaxasDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    paramId = null;
    mockService = {
      obterAtual: vi.fn().mockReturnValue(of({ taxa: 3, comissaoVenda: 1, comissaoCompra: 2, gta: 5 } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
  });

  it('em modo de criação (sem :id), não carrega a taxa atual', () => {
    setup();
    fixture.detectChanges();
    expect(component.isEdicao).toBe(false);
    expect(mockService.obterAtual).not.toHaveBeenCalled();
  });

  it('quando há :id na rota, carrega a taxa atual para edição', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    expect(component.isEdicao).toBe(true);
    expect(mockService.obterAtual).toHaveBeenCalled();
    expect(component.form.get('taxa')?.value).toBe(3);
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockService.obterAtual.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('salvar() com valores negativos não chama o service', () => {
    setup();
    fixture.detectChanges();
    component.form.patchValue({ taxa: -1 });
    component.salvar();
    expect(mockService.salvar).not.toHaveBeenCalled();
  });

  it('salvar() chama service.salvar() (sempre cria uma nova taxa vigente) e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    component.form.setValue({ taxa: 4, comissaoVenda: 1, comissaoCompra: 2, gta: 3 });

    component.salvar();

    expect(mockService.salvar).toHaveBeenCalledWith({ taxa: 4, comissaoVenda: 1, comissaoCompra: 2, gta: 3 } as any);
    expect(mockAlert.success).toHaveBeenCalledWith('Nova taxa padrão cadastrada!');
    expect(navigateSpy).toHaveBeenCalledWith(['/taxas/lista']);
  });

  it('salvar() em modoDrawer emite aoSalvar em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoDrawer = true;
    const emitSpy = vi.fn();
    component.aoSalvar.subscribe(emitSpy);
    component.form.setValue({ taxa: 4, comissaoVenda: 1, comissaoCompra: 2, gta: 3 });

    component.salvar();

    expect(emitSpy).toHaveBeenCalledWith({ id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    component.form.setValue({ taxa: 4, comissaoVenda: 1, comissaoCompra: 2, gta: 3 });

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
