import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { RacaDetailsComponent } from './raca-details.component';
import { RacaService } from '../../../core/services/raca.service';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('RacaDetailsComponent', () => {
  let component: RacaDetailsComponent;
  let fixture: ComponentFixture<RacaDetailsComponent>;
  let mockService: any;
  let mockEspecieService: any;
  let mockAlert: any;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [RacaDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: RacaService, useValue: mockService },
        { provide: EspecieService, useValue: mockEspecieService },
        { provide: AlertService, useValue: mockAlert },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;
    fixture = TestBed.createComponent(RacaDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    paramId = null;
    mockService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, nome: 'Nelore', especieId: 2 } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
      atualizar: vi.fn().mockReturnValue(of({ id: 1 } as any)),
    };
    mockEspecieService = { listar: vi.fn().mockReturnValue(of([{ id: 2, nome: 'Bovino' }] as any)) };
    mockAlert = { success: vi.fn(), error: vi.fn() };
  });

  it('ngOnInit carrega a lista de espécies para o select', () => {
    setup();
    fixture.detectChanges();
    expect(mockEspecieService.listar).toHaveBeenCalled();
    expect(component.especies).toEqual([{ id: 2, nome: 'Bovino' }] as any);
  });

  it('em modo de edição, carrega a raça', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    expect(component.isEdicao).toBe(true);
    expect(component.form.get('nome')?.value).toBe('Nelore');
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockService.buscarPorId.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('salvar() sem especieId selecionado não chama o service', () => {
    setup();
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Angus' });
    component.salvar();
    expect(mockService.salvar).not.toHaveBeenCalled();
  });

  it('salvar() em modo de criação chama service.salvar() e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Angus', especieId: 2 });

    component.salvar();

    expect(mockService.salvar).toHaveBeenCalledWith({ nome: 'Angus', especieId: 2 } as any);
    expect(mockAlert.success).toHaveBeenCalledWith('Raça cadastrada!');
    expect(navigateSpy).toHaveBeenCalledWith(['/racas/lista']);
  });

  it('salvar() em modo de edição chama service.atualizar() com o id', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Nelore Editado', especieId: 2 });

    component.salvar();

    expect(mockService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Raça atualizada!');
  });

  it('salvar() em modoDrawer emite aoSalvar em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoDrawer = true;
    const emitSpy = vi.fn();
    component.aoSalvar.subscribe(emitSpy);
    component.form.patchValue({ nome: 'Angus', especieId: 2 });

    component.salvar();

    expect(emitSpy).toHaveBeenCalledWith({ id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Angus', especieId: 2 });

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
