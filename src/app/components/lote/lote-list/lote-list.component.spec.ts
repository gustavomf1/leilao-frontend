import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { LotesListComponent } from './lote-list.component';
import { LoteService } from '../../../core/services/lote.service';
import { LoteWebsocketService } from '../../../core/services/lote-websocket.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

describe('LotesListComponent', () => {
  let component: LotesListComponent;
  let fixture: ComponentFixture<LotesListComponent>;
  let mockLoteService: any;
  let mockAlert: any;
  let mockAuth: any;
  let novoLoteSubject: Subject<any>;

  const lotesMock = [
    { id: 1, status: 'AGUARDANDO_ESCRITORIO', naoVendidoNoLeilao: 'N', codigo: 'L-1' },
    { id: 2, status: 'FINALIZADO', naoVendidoNoLeilao: 'S', codigo: 'L-2' },
  ] as any;

  function setup() {
    TestBed.configureTestingModule({
      imports: [LotesListComponent],
      providers: [
        provideRouter([]),
        { provide: LoteService, useValue: mockLoteService },
        { provide: LoteWebsocketService, useValue: { novoLoteSubject } },
        { provide: AlertService, useValue: mockAlert },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LotesListComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    novoLoteSubject = new Subject();
    mockLoteService = {
      listar: vi.fn().mockReturnValue(of(lotesMock.map((l: any) => ({ ...l })))),
      avancarStatus: vi.fn().mockReturnValue(of({ id: 1, status: 'AGUARDANDO_LANCE' } as any)),
      deletar: vi.fn().mockReturnValue(of(undefined)),
      gerarNotaLeilao: vi.fn().mockReturnValue(of(new Blob())),
    };
    mockAlert = { success: vi.fn(), error: vi.fn(), confirm: vi.fn((_msg: string, cb: () => void) => cb()) };
    mockAuth = { isAdmin: () => true, hasPermission: () => false };
  });

  it('ngOnInit carrega os lotes do service', () => {
    setup();
    fixture.detectChanges();

    expect(mockLoteService.listar).toHaveBeenCalled();
    expect(component.lotes).toEqual(lotesMock);
  });

  it('ngOnInit aplica o filtro AGUARDANDO_ESCRITORIO para quem tem permissão de editar lotes mas não é admin', () => {
    mockAuth = { isAdmin: () => false, hasPermission: () => true };
    setup();
    fixture.detectChanges();

    expect(component.filtroStatus).toBe('AGUARDANDO_ESCRITORIO');
  });

  it('ngOnInit mantém o filtro TODOS para admins', () => {
    setup();
    fixture.detectChanges();
    expect(component.filtroStatus).toBe('TODOS');
  });

  it('lotesFiltrados filtra por status ou por não vendido no leilão', () => {
    setup();
    fixture.detectChanges();

    component.setFiltro('FINALIZADO');
    expect(component.lotesFiltrados).toEqual([lotesMock[1]]);

    component.setFiltro('NAO_VENDIDO');
    expect(component.lotesFiltrados).toEqual([lotesMock[1]]);

    component.setFiltro('TODOS');
    expect(component.lotesFiltrados).toEqual(lotesMock);
  });

  it('novoLoteSubject atualiza um lote existente ou adiciona um novo no topo', () => {
    setup();
    fixture.detectChanges();

    novoLoteSubject.next({ id: 1, status: 'AGUARDANDO_LANCE' });
    expect(component.lotes.find((l: any) => l.id === 1).status).toBe('AGUARDANDO_LANCE');

    novoLoteSubject.next({ id: 99, status: 'AGUARDANDO_ESCRITORIO' });
    expect(component.lotes[0].id).toBe(99);
  });

  it('avancarStatus() atualiza o lote na lista e mostra alerta de sucesso', () => {
    setup();
    fixture.detectChanges();

    component.avancarStatus(1);

    expect(mockLoteService.avancarStatus).toHaveBeenCalledWith(1);
    expect(component.lotes.find((l: any) => l.id === 1).status).toBe('AGUARDANDO_LANCE');
    expect(mockAlert.success).toHaveBeenCalled();
  });

  it('avancarStatus() mostra alerta de erro quando falha', () => {
    setup();
    mockLoteService.avancarStatus.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    fixture.detectChanges();

    component.avancarStatus(1);

    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
  });

  it('deletar() pede confirmação e, ao confirmar, remove o lote da lista', () => {
    setup();
    fixture.detectChanges();

    component.deletar(1);

    expect(mockLoteService.deletar).toHaveBeenCalledWith(1);
    expect(component.lotes.find((l: any) => l.id === 1)).toBeUndefined();
    expect(mockAlert.success).toHaveBeenCalledWith('Lote excluído!');
  });

  it('gerarNotaLeilao() rejeita lote inválido sem chamar o service', () => {
    setup();
    fixture.detectChanges();

    component.gerarNotaLeilao(null);

    expect(mockAlert.error).toHaveBeenCalledWith('Lote inválido');
    expect(mockLoteService.gerarNotaLeilao).not.toHaveBeenCalled();
  });

  it('gerarNotaLeilao() abre a nota em uma nova aba quando o lote é válido', () => {
    setup();
    fixture.detectChanges();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    component.gerarNotaLeilao({ id: 5 });

    expect(mockLoteService.gerarNotaLeilao).toHaveBeenCalledWith(5);
    expect(openSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');
  });

  it('exibe o código do lote com o prefixo fixo LOTE-', () => {
    setup();
    fixture.detectChanges();

    const textos = Array.from(fixture.nativeElement.querySelectorAll('.lote-id'))
      .map((el: any) => el.textContent.trim());
    expect(textos).toContain('LOTE-L-1');
    expect(textos).toContain('LOTE-L-2');
  });
});
