import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { EspecieListComponent } from './especie-list.component';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('EspecieListComponent', () => {
  let component: EspecieListComponent;
  let fixture: ComponentFixture<EspecieListComponent>;
  let mockService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockService = {
      listarTodas: vi.fn().mockReturnValue(of([{ id: 1, nome: 'Bovino', inativo: 'N' }] as any)),
      inativar: vi.fn().mockReturnValue(of({})),
    };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };

    await TestBed.configureTestingModule({
      imports: [EspecieListComponent],
      providers: [
        provideRouter([]),
        { provide: EspecieService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EspecieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega todas as espécies', () => {
    expect(mockService.listarTodas).toHaveBeenCalled();
    expect(component.especies$.value).toEqual([{ id: 1, nome: 'Bovino', inativo: 'N' }] as any);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockService.listarTodas.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('abrirDrawerNovo()/fecharDrawer() controlam o estado do drawer', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);
    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);
  });

  it('toggleInativo() inativa uma espécie ativa', () => {
    component.toggleInativo({ id: 1, nome: 'Bovino', inativo: 'N' } as any);
    expect(mockService.inativar).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Espécie inativada!');
  });

  it('toggleInativo() ativa uma espécie inativa', () => {
    component.toggleInativo({ id: 1, nome: 'Bovino', inativo: 'S' } as any);
    expect(mockAlert.success).toHaveBeenCalledWith('Espécie ativada!');
  });
});
