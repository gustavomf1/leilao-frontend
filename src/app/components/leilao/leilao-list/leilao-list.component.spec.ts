import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { LeiloesListComponent } from './leilao-list.component';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('LeiloesListComponent', () => {
  let component: LeiloesListComponent;
  let fixture: ComponentFixture<LeiloesListComponent>;
  const leiloesMock = [{ id: 1, descricao: 'Leilão de outono' }] as any;

  let mockLeilaoService: { listar: ReturnType<typeof vi.fn>; deletar: ReturnType<typeof vi.fn> };
  let mockAlert: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockLeilaoService = { listar: vi.fn().mockReturnValue(of(leiloesMock)), deletar: vi.fn().mockReturnValue(of(undefined)) };
    mockAlert = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LeiloesListComponent],
      providers: [
        provideRouter([]),
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeiloesListComponent);
    component = fixture.componentInstance;
  });

  it('ngOnInit carrega os leilões do service', () => {
    fixture.detectChanges();
    expect(mockLeilaoService.listar).toHaveBeenCalled();
    expect(component.leiloes).toEqual(leiloesMock);
  });

  it('carregar() mostra alerta de erro quando o service falha', () => {
    mockLeilaoService.listar.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('deletar() não chama o service quando o usuário cancela a confirmação nativa', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.detectChanges();

    component.deletar(1);

    expect(mockLeilaoService.deletar).not.toHaveBeenCalled();
  });

  it('deletar() chama o service e recarrega a lista quando confirmado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.detectChanges();
    mockLeilaoService.listar.mockClear();

    component.deletar(1);

    expect(mockLeilaoService.deletar).toHaveBeenCalledWith(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Leilão excluído!');
    expect(mockLeilaoService.listar).toHaveBeenCalled();
  });

  it('deletar() mostra alerta de erro quando o service falha', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockLeilaoService.deletar.mockReturnValue(throwError(() => ({ error: { mensagem: 'não pôde excluir' } })));
    fixture.detectChanges();

    component.deletar(1);

    expect(mockAlert.error).toHaveBeenCalledWith('não pôde excluir');
  });
});
