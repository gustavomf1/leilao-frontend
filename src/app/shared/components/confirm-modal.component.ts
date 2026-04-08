import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule, ButtonDirective } from '@coreui/angular';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalModule, ButtonDirective],
  template: `
    <div *ngIf="visible" class="modal-backdrop-custom" (click)="cancelar()"></div>
    <div *ngIf="visible" class="confirm-modal-custom">
      <div class="confirm-box">
        <h5 class="mb-3">Confirmação</h5>
        <p>{{ message }}</p>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button cButton color="secondary" size="sm" (click)="cancelar()">Cancelar</button>
          <button cButton [color]="confirmColor" size="sm" (click)="confirmar()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1040;
    }
    .confirm-modal-custom {
      position: fixed;
      inset: 0;
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .confirm-box {
      background: var(--cui-body-bg);
      border: 1px solid var(--cui-border-color);
      border-radius: 12px;
      padding: 1.5rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
  `]
})
export class ConfirmModalComponent implements OnInit {
  private alertService = inject(AlertService);

  visible = false;
  message = '';
  confirmLabel = 'Excluir';
  confirmColor = 'danger';
  private callback?: () => void;

  ngOnInit() {
    this.alertService.confirm$.subscribe(({ message, callback, confirmLabel, confirmColor }) => {
      this.message = message;
      this.callback = callback;
      this.confirmLabel = confirmLabel || 'Excluir';
      this.confirmColor = confirmColor || 'danger';
      this.visible = true;
    });
  }

  confirmar() {
    this.callback?.();
    this.visible = false;
  }

  cancelar() {
    this.visible = false;
  }
}