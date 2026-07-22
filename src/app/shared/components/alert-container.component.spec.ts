import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AlertContainerComponent } from './alert-container.component';
import { AlertService } from '../services/alert.service';

describe('AlertContainerComponent', () => {
  let component: AlertContainerComponent;
  let fixture: ComponentFixture<AlertContainerComponent>;
  let alertService: AlertService;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [AlertContainerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(AlertContainerComponent);
    component = fixture.componentInstance;
    alertService = TestBed.inject(AlertService);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('exibe um alerta emitido pelo AlertService e o remove após o delay', () => {
    alertService.success('feito!');
    expect(component.alerts).toEqual([{ message: 'feito!', color: 'success', dismissible: true, delay: 4000 }]);

    vi.advanceTimersByTime(4000);
    expect(component.alerts).toEqual([]);
  });

  it('onDismiss() remove o alerta pelo índice quando fechado manualmente', () => {
    alertService.success('a');
    alertService.error('b');

    component.onDismiss(0, false);

    expect(component.alerts).toEqual([{ message: 'b', color: 'danger', dismissible: true, delay: 5000 }]);
  });
});
