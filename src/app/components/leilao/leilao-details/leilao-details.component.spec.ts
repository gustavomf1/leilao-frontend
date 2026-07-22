import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { LeiloesDetailsComponent } from './leilao-details.component';
import { LeilaoService } from '../../../core/services/leilao.service';
import { TaxasService } from '../../../core/services/taxas.service';
import { CondicoesService } from '../../../core/services/condicoes.service';
import { EspecieService } from '../../../core/services/especie.service';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('LeiloesDetailsComponent', () => {
  let component: LeiloesDetailsComponent;
  let fixture: ComponentFixture<LeiloesDetailsComponent>;

  let mockLeilaoService: any;
  let mockTaxasService: any;
  let mockCondicoesService: any;
  let mockEspecieService: any;
  let mockFuncionarioService: any;
  let mockAlert: any;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let paramId: string | null;

  const condicoesMock = [{ id: 1, descricao: 'À vista', tipoCondicao: 'VISTA' }];

  function setup() {
    TestBed.configureTestingModule({
      imports: [LeiloesDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: LeilaoService, useValue: mockLeilaoService },
        { provide: TaxasService, useValue: mockTaxasService },
        { provide: CondicoesService, useValue: mockCondicoesService },
        { provide: EspecieService, useValue: mockEspecieService },
        { provide: FuncionarioService, useValue: mockFuncionarioService },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: { isAdmin: () => true, hasPermission: () => true } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramId } } } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as any;

    fixture = TestBed.createComponent(LeiloesDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    paramId = null;
    mockLeilaoService = {
      buscarPorId: vi.fn().mockReturnValue(of({ id: 1, descricao: 'Leilão X', condicoesId: 1 })),
      salvar: vi.fn().mockReturnValue(of({})),
      atualizar: vi.fn().mockReturnValue(of({})),
    };
    mockTaxasService = { obterAtual: vi.fn().mockReturnValue(of({ id: 5, taxa: 3 })) };
    mockCondicoesService = { listar: vi.fn().mockReturnValue(of(condicoesMock)) };
    mockEspecieService = { listar: vi.fn().mockReturnValue(of([{ id: 2, nome: 'Bovino' }])) };
    mockFuncionarioService = { listar: vi.fn().mockReturnValue(of([{ id: 3, nome: 'João' }])) };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn() };
  });

  it('ngOnInit carrega taxa padrão, condições, espécies e leiloeiros', () => {
    setup();
    fixture.detectChanges();

    expect(component.taxaPadrao).toEqual({ id: 5, taxa: 3 } as any);
    expect(component.condicoes).toEqual(condicoesMock);
    expect(component.especies).toEqual([{ id: 2, nome: 'Bovino' }] as any);
    expect(component.leiloeiros).toEqual([{ id: 3, nome: 'João' }] as any);
  });

  it('em modo de criação, aplica a taxa padrão vigente automaticamente no form', () => {
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(false);
    expect(component.form.get('taxaPadraoId')?.value).toBe(5);
  });

  it('quando há :id na rota, entra em modo de edição e carrega o leilão', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();

    expect(component.isEdicao).toBe(true);
    expect(mockLeilaoService.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.form.get('descricao')?.value).toBe('Leilão X');
  });

  it('selecionarCondicao() atualiza a condição selecionada e fecha o drawer', () => {
    setup();
    fixture.detectChanges();

    component.selecionarCondicao(condicoesMock[0] as any);

    expect(component.condicaoSelecionada).toEqual(condicoesMock[0]);
    expect(component.form.get('condicoesId')?.value).toBe(1);
    expect(component.modalCondicaoAberto).toBe(false);
  });

  it('condicoesFiltradas filtra pela descrição, tipo ou id', () => {
    setup();
    fixture.detectChanges();

    component.condicaoFiltro = 'vista';
    expect(component.condicoesFiltradas).toEqual(condicoesMock);

    component.condicaoFiltro = 'nao existe';
    expect(component.condicoesFiltradas).toEqual([]);
  });

  it('salvar() com form inválido não chama o service', () => {
    setup();
    fixture.detectChanges();

    component.salvar();

    expect(mockLeilaoService.salvar).not.toHaveBeenCalled();
  });

  function preencherFormValido() {
    component.form.setValue({
      local: 'Parque de Exposições', uf: 'sp', cidade: 'Ribeirão Preto',
      descricao: 'Leilão de teste', data: '2026-08-01', condicoesId: 1,
      taxaPadraoId: 5, especieId: 2, leiloeiroId: 3, tipoLeilao: 'PRESENCIAL', taxaPor: 'ANIMAL',
    });
  }

  it('salvar() em modo de criação chama service.salvar(), envia uf maiúsculo e navega para a lista', () => {
    setup();
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockLeilaoService.salvar.mock.calls[0][0].uf).toBe('SP');
    expect(mockAlert.success).toHaveBeenCalledWith('Leilão cadastrado!');
    expect(navigateSpy).toHaveBeenCalledWith(['/leiloes/lista']);
  });

  it('salvar() em modo de edição chama service.atualizar() com o id', () => {
    paramId = '1';
    setup();
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockLeilaoService.atualizar.mock.calls[0][0]).toBe(1);
    expect(mockLeilaoService.atualizar.mock.calls[0][1].uf).toBe('SP');
    expect(mockAlert.success).toHaveBeenCalledWith('Leilão atualizado!');
  });

  it('salvar() mostra alerta de erro quando o service falha', () => {
    setup();
    mockLeilaoService.salvar.mockReturnValue(throwError(() => ({ error: { mensagem: 'erro ao salvar' } })));
    fixture.detectChanges();
    preencherFormValido();

    component.salvar();

    expect(mockAlert.error).toHaveBeenCalledWith('erro ao salvar');
  });
});
