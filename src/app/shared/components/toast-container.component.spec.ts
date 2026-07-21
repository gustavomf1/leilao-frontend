import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '../services/toast.service';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('exibe um toast emitido pelo ToastService e o remove após delay + 500ms', () => {
    toastService.success('feito!');
    expect(component.toasts.length).toBe(1);

    vi.advanceTimersByTime(3500);
    expect(component.toasts.length).toBe(0);
  });
});
