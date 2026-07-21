import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { FazendasDetailsComponent } from './fazenda-details.component';
import { FazendaService } from '../../../core/services/fazenda.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SubformService } from '../../../shared/services/subform.service';
import { ClienteService } from '../../../core/services/cliente.service';

describe('FazendasDetailsComponent', () => {
  let component: FazendasDetailsComponent;
  let fixture: ComponentFixture<FazendasDetailsComponent>;

  let mockFazendaService: any;
  let mockAlert: any;
  let mockClienteService: any;
  let resultadoSubject: Subject<{ chave: string; dados: any }>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [FazendasDetailsComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        { provide: FazendaService, useValue: mockFazendaService },
        { provide: AlertService, useValue: mockAlert },
        { provide: SubformService, useValue: { resultado$: resultadoSubject.asObservable(), emitir: vi.fn() } },
        { provide: ClienteService, useValue: mockClienteService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;

    fixture = TestBed.createComponent(FazendasDetailsComponent);
    component = fixture.componentInstance;
  }

  function preencherFormValido() {
    component.form.setValue({
      inscricao: '123', nome: 'Fazenda Boa Vista', uf: 'sp', cidade: 'Ribeirão',
      cpfCnpj: '12.345.678/0001-00', endereco: 'Rod X', fone: '11999999999', contato: 'João', titularId: null,
    });
  }

  beforeEach(() => {
    paramId = null;
    resultadoSubject = new Subject();
    mockFazendaService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, nome: 'Fazenda X', titularId: null } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
      atualizar: vi.fn().mockReturnValue(of({ id: 1 } as any)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
    mockClienteService = { buscarPorId: vi.fn().mockReturnValue(of({ id: 4, nome: 'João Titular' } as any)) };
  });

  it('ngOnInit monta o form em modo de criação', () => {
    setup();
    fixture.detectChanges();
    expect(component.isEdicao).toBe(false);
  });

  it('quando há :id na rota, entra em modo de edição e carrega a fazenda', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(true);
    expect(mockFazendaService.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.form.get('nome')?.value).toBe('Fazenda X');
  });

  it('quando a fazenda carregada tem titularId, busca e exibe o nome do titular', () => {
    paramId = '1';
    mockFazendaService.buscarPorId.mockReturnValue(of({ id: 1, nome: 'Fazenda X', titularId: 4 } as any));
    setup();
    fixture.detectChanges();

    expect(mockClienteService.buscarPorId).toHaveBeenCalledWith(4);
    expect(component.nomeTitularSelecionado).toBe('João Titular');
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockFazendaService.buscarPorId.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('a inscrição em resultado$ atualiza titularId quando o subform emite "titular"', () => {
    setup();
    fixture.detectChanges();

    resultadoSubject.next({ chave: 'titular', dados: { id: 4, nome: 'João Titular' } });

    expect(component.form.get('titularId')?.value).toBe(4);
    expect(component.nomeTitularSelecionado).toBe('João Titular');
  });

  it('salvar() com form inválido não chama o service', () => {
    setup();
    fixture.detectChanges();
    component.salvar();
    expect(mockFazendaService.salvar).not.toHaveBeenCalled();
  });

  it('salvar() em modo de criação chama service.salvar() e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockFazendaService.salvar).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalledWith('Fazenda cadastrada!');
    expect(navigateSpy).toHaveBeenCalledWith(['/fazendas/lista']);
  });

  it('salvar() em modo de edição chama service.atualizar() com o id', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockFazendaService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockAlert.success).toHaveBeenCalledWith('Fazenda atualizada!');
  });

  it('salvar() em modoSubform emite "fazenda" via SubformService em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoSubform = true;
    preencherFormValido();

    component.salvar();

    expect(TestBed.inject(SubformService).emitir).toHaveBeenCalledWith('fazenda', { id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() em modoDrawer emite aoSalvar em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoDrawer = true;
    const emitSpy = vi.fn();
    component.aoSalvar.subscribe(emitSpy);
    preencherFormValido();

    component.salvar();

    expect(emitSpy).toHaveBeenCalledWith({ id: 9 });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockFazendaService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
