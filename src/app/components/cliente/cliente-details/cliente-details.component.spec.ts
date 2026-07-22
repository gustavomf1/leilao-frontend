import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { ClientesDetailsComponent } from './cliente-details.component';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SubformService } from '../../../shared/services/subform.service';
import { FazendaService } from '../../../core/services/fazenda.service';

describe('ClientesDetailsComponent', () => {
  let component: ClientesDetailsComponent;
  let fixture: ComponentFixture<ClientesDetailsComponent>;

  let mockClienteService: any;
  let mockAlert: any;
  let mockFazendaService: any;
  let resultadoSubject: Subject<{ chave: string; dados: any }>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  function setup() {
    TestBed.configureTestingModule({
      imports: [ClientesDetailsComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        { provide: ClienteService, useValue: mockClienteService },
        { provide: AlertService, useValue: mockAlert },
        { provide: SubformService, useValue: { resultado$: resultadoSubject.asObservable(), emitir: vi.fn() } },
        { provide: FazendaService, useValue: mockFazendaService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;

    fixture = TestBed.createComponent(ClientesDetailsComponent);
    component = fixture.componentInstance;
  }

  function preencherFormValido() {
    component.form.setValue({
      nome: 'Maria', email: 'maria@a.com', pessoa: 'F', cpfCnpj: '123.456.789-00',
      ddi: '55', telefone: '(11) 99999-9999', cidade: 'SP', uf: 'sp', rg: '12.345.678-9',
      fazendaId: null, usu_aceita_remarketing: false,
    });
  }

  beforeEach(() => {
    paramId = null;
    resultadoSubject = new Subject();
    mockClienteService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, nome: 'João', fazendaId: null } as any)),
      salvar: vi.fn().mockReturnValue(of({ id: 9 } as any)),
      atualizar: vi.fn().mockReturnValue(of({ id: 1 } as any)),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };
    mockFazendaService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 5, nome: 'Fazenda Boa Vista' } as any)),
      atualizar: vi.fn().mockReturnValue(of({})),
    };
  });

  it('ngOnInit monta o form em modo de criação', () => {
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(false);
    expect(component.form.get('ddi')?.value).toBe('55');
  });

  it('quando há :id na rota, entra em modo de edição, desabilita cpfCnpj e carrega o cliente', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(true);
    expect(mockClienteService.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.form.get('cpfCnpj')?.disabled).toBe(true);
    expect(component.form.get('nome')?.value).toBe('João');
  });

  it('quando o cliente carregado tem fazendaId, busca e exibe o nome da fazenda', () => {
    paramId = '1';
    mockClienteService.buscarPorId.mockReturnValue(of({ id: 1, nome: 'João', fazendaId: 5 } as any));
    setup();
    fixture.detectChanges();

    expect(mockFazendaService.buscarPorId).toHaveBeenCalledWith(5);
    expect(component.nomeFazendaSelecionada).toBe('Fazenda Boa Vista');
  });

  it('carregarPorId() mostra alerta de erro quando falha', () => {
    paramId = '1';
    mockClienteService.buscarPorId.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    setup();
    fixture.detectChanges();

    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('isBrazilianDdi reflete o ddi selecionado no form', () => {
    setup();
    fixture.detectChanges();

    expect(component.isBrazilianDdi).toBe(true);
    component.form.patchValue({ ddi: '1' });
    expect(component.isBrazilianDdi).toBe(false);
  });

  it('a inscrição em resultado$ atualiza fazendaId quando o subform emite "fazenda"', () => {
    setup();
    fixture.detectChanges();

    resultadoSubject.next({ chave: 'fazenda', dados: { id: 8, nome: 'Sítio Alegre' } });

    expect(component.form.get('fazendaId')?.value).toBe(8);
    expect(component.nomeFazendaSelecionada).toBe('Sítio Alegre');
  });

  it('salvar() com form inválido marca todos os campos como touched e não chama o service', () => {
    setup();
    fixture.detectChanges();

    component.salvar();

    expect(component.form.get('nome')?.touched).toBe(true);
    expect(mockClienteService.salvar).not.toHaveBeenCalled();
  });

  it('salvar() em modo de criação chama service.salvar() e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockClienteService.salvar).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalledWith('Cliente cadastrado!');
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes/lista']);
  });

  it('salvar() em modo de edição chama service.atualizar() com o id', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockClienteService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockClienteService.atualizar.mock.calls[0][1].nome).toBe('Maria');
  });

  it('salvar() em modoSubform emite o resultado via SubformService em vez de navegar', () => {
    setup();
    fixture.detectChanges();
    component.modoSubform = true;
    preencherFormValido();

    component.salvar();

    expect(TestBed.inject(SubformService).emitir).toHaveBeenCalledWith('titular', { id: 9 });
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
    mockClienteService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
