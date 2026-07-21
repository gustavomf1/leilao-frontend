import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TaxasListComponent } from './taxas-list.component';
import { TaxasService } from '../../../core/services/taxas.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('TaxasListComponent', () => {
  let component: TaxasListComponent;
  let fixture: ComponentFixture<TaxasListComponent>;
  let mockService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockService = { listar: vi.fn().mockReturnValue(of([{ id: 1, taxa: 3 }] as any)) };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaxasListComponent],
      providers: [
        provideRouter([]),
        { provide: TaxasService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaxasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega a taxa atual', () => {
    expect(mockService.listar).toHaveBeenCalled();
    expect(component.taxas$.value).toEqual([{ id: 1, taxa: 3 }] as any);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockService.listar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('abrirDrawerNovo()/fecharDrawer() controlam o estado do drawer', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);
  });

  it('onTaxaSalva() fecha o drawer e recarrega a lista', () => {
    component.abrirDrawerNovo();
    mockService.listar.mockClear();
    component.onTaxaSalva();
    expect(component.drawerAberto).toBe(false);
    expect(mockService.listar).toHaveBeenCalled();
  });

  it('onEsc() fecha o drawer quando aberto', () => {
    component.abrirDrawerNovo();
    component.onEsc();
    expect(component.drawerAberto).toBe(false);
  });
});
