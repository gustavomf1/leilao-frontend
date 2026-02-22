import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from '@coreui/angular';
import { Alert, AlertService } from '../services/alert.service';

@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [CommonModule, AlertModule],
  template: `
    <div style="position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 9999; width: 500px;">
      @for (alert of alerts; track $index) {
        <c-alert
          [color]="alert.color || 'info'"
          [dismissible]="alert.dismissible ?? true"
          [visible]="true"
          (visibleChange)="onDismiss($index, $event)"
          [fade]="true"
        >
          {{ alert.message }}
        </c-alert>
      }
    </div>
  `
})
export class AlertContainerComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.alertService.alert$.subscribe(alert => {
      this.alerts.push(alert);
      this.cdr.detectChanges(); // força a atualização da view

      if (alert.delay) {
        setTimeout(() => {
          this.alerts.shift();
          this.cdr.detectChanges();
        }, alert.delay);
      }
    });
  }

  onDismiss(index: number, visible: boolean) {
    if (!visible) {
      this.alerts.splice(index, 1);
      this.cdr.detectChanges();
    }
  }
}