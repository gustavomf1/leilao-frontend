import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { RacaListComponent } from './raca-list.component';
import { RacaService } from '../../../core/services/raca.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('RacaListComponent', () => {
  let component: RacaListComponent;
  let fixture: ComponentFixture<RacaListComponent>;
  let mockService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockService = {
      listarTodas: vi.fn().mockReturnValue(of([{ id: 1, nome: 'Nelore', inativo: 'N' }] as any)),
      toggleInativo: vi.fn().mockReturnValue(of({})),
    };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };

    await TestBed.configureTestingModule({
      imports: [RacaListComponent],
      providers: [
        provideRouter([]),
        { provide: RacaService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RacaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit carrega todas as raças', () => {
    expect(mockService.listarTodas).toHaveBeenCalled();
    expect(component.racas$.value).toEqual([{ id: 1, nome: 'Nelore', inativo: 'N' }] as any);
  });

  it('carregar() mostra alerta de erro quando falha', () => {
    mockService.listarTodas.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.carregar();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('abrirDrawerNovo()/abrirDrawerEditar()/fecharDrawer() controlam o estado do drawer', () => {
    component.abrirDrawerNovo();
    expect(component.drawerAberto).toBe(true);
    component.fecharDrawer();
    expect(component.drawerAberto).toBe(false);
    component.abrirDrawerEditar(5);
    expect(component.drawerRacaId).toBe(5);
  });

  it('toggleInativo() inativa uma raça ativa', () => {
    component.toggleInativo({ id: 1, nome: 'Nelore', inativo: 'N' } as any);
    expect(mockService.toggleInativo).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Raça inativada!');
  });

  it('toggleInativo() ativa uma raça inativa', () => {
    component.toggleInativo({ id: 1, nome: 'Nelore', inativo: 'S' } as any);
    expect(mockAlert.success).toHaveBeenCalledWith('Raça ativada!');
  });
});
