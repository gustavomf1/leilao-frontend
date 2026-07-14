import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { LoteFotosComponent } from './lote-fotos.component';
import { UploadQueueService } from '../../../core/services/upload-queue.service';
import { LoteFotoService } from '../../../core/services/lote-foto.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';

describe('LoteFotosComponent — menu mobile', () => {
  let component: LoteFotosComponent;
  let fixture: ComponentFixture<LoteFotosComponent>;

  const mockQueue = {
    queue$: new BehaviorSubject<any[]>([]),
    completed$: new Subject<any>(),
    enqueue: vi.fn(),
    assignLoteId: vi.fn(),
    retryItem: vi.fn(),
  };

  const mockFotoService = {
    listar: vi.fn().mockReturnValue(of([])),
    deletar: vi.fn().mockReturnValue(of(null)),
  };

  const mockAuth = {
    isAdmin: vi.fn().mockReturnValue(false),
    hasPermission: vi.fn().mockReturnValue(false),
    isManejo: vi.fn().mockReturnValue(true),
  };

  const mockAlert = {
    error: vi.fn(),
    confirm: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteFotosComponent],
      providers: [
        { provide: UploadQueueService, useValue: mockQueue },
        { provide: LoteFotoService, useValue: mockFotoService },
        { provide: AuthService, useValue: mockAuth },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoteFotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uploadMenuAberto começa como false', () => {
    expect(component.uploadMenuAberto).toBe(false);
  });

  it('toggleUploadMenu abre o menu e chama stopPropagation', () => {
    const stopPropagation = vi.fn();
    const event = { stopPropagation } as unknown as MouseEvent;
    component.toggleUploadMenu(event);
    expect(component.uploadMenuAberto).toBe(true);
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('toggleUploadMenu fecha o menu quando já está aberto', () => {
    component.uploadMenuAberto = true;
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    component.toggleUploadMenu(event);
    expect(component.uploadMenuAberto).toBe(false);
  });

  it('fecharUploadMenu define uploadMenuAberto como false', () => {
    component.uploadMenuAberto = true;
    component.fecharUploadMenu();
    expect(component.uploadMenuAberto).toBe(false);
  });

  it('onFileSelected fecha o menu após selecionar arquivos', () => {
    component.uploadMenuAberto = true;
    const file = new File([''], 'foto.jpg', { type: 'image/jpeg' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    const event = { target: input } as unknown as Event;
    component.onFileSelected(event);
    expect(component.uploadMenuAberto).toBe(false);
  });

  it('podeEditar retorna true quando isManejo() é true (mesmo sem isAdmin/hasPermission)', () => {
    expect(component.podeEditar()).toBe(true);
  });

  it('podeEditar retorna false quando isManejo, isAdmin e hasPermission são todos false', () => {
    mockAuth.isManejo.mockReturnValueOnce(false);
    expect(component.podeEditar()).toBe(false);
  });
});
