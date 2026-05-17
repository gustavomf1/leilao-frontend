import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    enqueue: jasmine.createSpy('enqueue'),
    assignLoteId: jasmine.createSpy('assignLoteId'),
    retryItem: jasmine.createSpy('retryItem'),
  };

  const mockFotoService = {
    listar: jasmine.createSpy('listar').and.returnValue(of([])),
    deletar: jasmine.createSpy('deletar').and.returnValue(of(null)),
  };

  const mockAuth = {
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(false),
    isManejo: jasmine.createSpy('isManejo').and.returnValue(true),
  };

  const mockAlert = {
    error: jasmine.createSpy('error'),
    confirm: jasmine.createSpy('confirm'),
  };

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
    expect(component.uploadMenuAberto).toBeFalse();
  });

  it('toggleUploadMenu abre o menu e chama stopPropagation', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.toggleUploadMenu(event);
    expect(component.uploadMenuAberto).toBeTrue();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('toggleUploadMenu fecha o menu quando já está aberto', () => {
    component.uploadMenuAberto = true;
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.toggleUploadMenu(event);
    expect(component.uploadMenuAberto).toBeFalse();
  });

  it('fecharUploadMenu define uploadMenuAberto como false', () => {
    component.uploadMenuAberto = true;
    component.fecharUploadMenu();
    expect(component.uploadMenuAberto).toBeFalse();
  });

  it('onFileSelected fecha o menu após selecionar arquivos', () => {
    component.uploadMenuAberto = true;
    const file = new File([''], 'foto.jpg', { type: 'image/jpeg' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    const event = { target: input } as unknown as Event;
    component.onFileSelected(event);
    expect(component.uploadMenuAberto).toBeFalse();
  });
});
