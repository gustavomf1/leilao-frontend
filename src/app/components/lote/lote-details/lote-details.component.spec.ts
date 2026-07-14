import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LotesDetailsComponent } from './lote-details.component';
import { LoteService } from '../../../core/services/lote.service';
import { AuthService } from '../../../core/services/auth.service';
import { EspecieService } from '../../../core/services/especie.service';
import { RacaService } from '../../../core/services/raca.service';
import { LeilaoService } from '../../../core/services/leilao.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { PixService } from '../../../core/services/pix.service';
import { AlertService } from '../../../shared/services/alert.service';
import { UploadQueueService } from '../../../core/services/upload-queue.service';
import { LoteFotoService } from '../../../core/services/lote-foto.service';

describe('LotesDetailsComponent — fotos no cadastro (manejo)', () => {
  let component: LotesDetailsComponent;
  let fixture: ComponentFixture<LotesDetailsComponent>;

  const mockLoteService = {
    salvar: vi.fn().mockReturnValue(of({ id: 42, codigo: 'L-001' })),
    atualizar: vi.fn().mockReturnValue(of({})),
    buscarPorId: vi.fn().mockReturnValue(of({})),
  };

  const mockAuth = {
    isManejo: vi.fn().mockReturnValue(true),
    isAdmin: vi.fn().mockReturnValue(false),
    hasPermission: vi.fn().mockReturnValue(false),
  };

  const mockUploadQueue = {
    assignLoteId: vi.fn().mockResolvedValue(undefined),
    clearOrphans: vi.fn().mockResolvedValue(undefined),
    queue$: of([]),
    completed$: of(),
  };

  const listVazio = { listar: vi.fn().mockReturnValue(of([])) };
  const mockAlert = { error: vi.fn(), success: vi.fn(), confirm: vi.fn() };

  beforeEach(() => vi.clearAllMocks());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotesDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoteService, useValue: mockLoteService },
        { provide: AuthService, useValue: mockAuth },
        { provide: EspecieService, useValue: listVazio },
        { provide: RacaService, useValue: { listarPorEspecie: vi.fn().mockReturnValue(of([])) } },
        { provide: LeilaoService, useValue: listVazio },
        { provide: ClienteService, useValue: listVazio },
        { provide: PixService, useValue: listVazio },
        { provide: AlertService, useValue: mockAlert },
        { provide: UploadQueueService, useValue: mockUploadQueue },
        { provide: LoteFotoService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LotesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loteIdAtual é null (não undefined) antes de salvar', () => {
    expect(component.loteIdAtual).toBeNull();
  });

  it('ao cadastrar (manejo), chama uploadQueue.assignLoteId com o id retornado pelo backend', () => {
    component.form.patchValue({
      codigo: 'L-001', qntdAnimais: 1, sexo: 'Macho', idadeEmMeses: 10,
      peso: 200, raca: 'Nelore', especieId: 1, categoriaAnimal: 'Bezerro'
    });
    (component as any).executarSalvar();
    expect(mockUploadQueue.assignLoteId).toHaveBeenCalledWith(42);
    expect(component.loteIdAtual).toBe(42);
  });

  it('ngOnDestroy limpa órfãos se saiu do cadastro sem salvar', () => {
    component.ngOnDestroy();
    expect(mockUploadQueue.clearOrphans).toHaveBeenCalled();
  });

  it('ngOnDestroy não limpa órfãos se o lote já foi salvo', () => {
    component.form.patchValue({
      codigo: 'L-001', qntdAnimais: 1, sexo: 'Macho', idadeEmMeses: 10,
      peso: 200, raca: 'Nelore', especieId: 1, categoriaAnimal: 'Bezerro'
    });
    (component as any).executarSalvar();
    vi.clearAllMocks();
    component.ngOnDestroy();
    expect(mockUploadQueue.clearOrphans).not.toHaveBeenCalled();
  });
});
