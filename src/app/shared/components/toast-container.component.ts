import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastModule],
  template: `
    <c-toaster placement="top-end" position="fixed">
      @for (toast of toasts; track $index) {
        <c-toast
          [color]="toast.color || 'info'"
          [delay]="toast.delay ?? 3000"
          [autohide]="true"
          [visible]="true"
        >
          <c-toast-header [closeButton]="true">
            {{ toast.title }}
          </c-toast-header>
          <c-toast-body>{{ toast.message }}</c-toast-body>
        </c-toast>
      }
    </c-toaster>
  `
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService,
        private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.toastService.toast$.subscribe((toast: any) => {
      this.toasts.push(toast);
      this.cdr.detectChanges(); 
      setTimeout(() => {
        this.toasts.shift();
        this.cdr.detectChanges();
      }, (toast.delay ?? 3000) + 500);
    });
  }
}