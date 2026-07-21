import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PaginacaoComponent } from './paginacao.component';

describe('PaginacaoComponent', () => {
  let component: PaginacaoComponent;
  let fixture: ComponentFixture<PaginacaoComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [PaginacaoComponent] }).compileComponents();
    fixture = TestBed.createComponent(PaginacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('onBuscaDigitada() emite buscaMudou após o debounce de 400ms', () => {
    const emitSpy = vi.fn();
    component.buscaMudou.subscribe(emitSpy);

    component.termoBusca = 'joao';
    component.onBuscaDigitada();
    vi.advanceTimersByTime(399);
    expect(emitSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(emitSpy).toHaveBeenCalledWith('joao');
  });

  it('onBuscaDigitada() não emite de novo para o mesmo termo consecutivo (distinctUntilChanged)', () => {
    const emitSpy = vi.fn();
    component.buscaMudou.subscribe(emitSpy);

    component.termoBusca = 'joao';
    component.onBuscaDigitada();
    vi.advanceTimersByTime(400);

    component.termoBusca = 'joao';
    component.onBuscaDigitada();
    vi.advanceTimersByTime(400);

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('onTamanhoAlterado() emite tamanhoMudou convertido para número', () => {
    const emitSpy = vi.fn();
    component.tamanhoMudou.subscribe(emitSpy);

    component.onTamanhoAlterado('50');

    expect(emitSpy).toHaveBeenCalledWith(50);
  });

  it('irPara() emite paginaMudou apenas dentro dos limites válidos', () => {
    component.totalPaginas = 3;
    const emitSpy = vi.fn();
    component.paginaMudou.subscribe(emitSpy);

    component.irPara(-1);
    component.irPara(3);
    expect(emitSpy).not.toHaveBeenCalled();

    component.irPara(1);
    expect(emitSpy).toHaveBeenCalledWith(1);
  });
});
