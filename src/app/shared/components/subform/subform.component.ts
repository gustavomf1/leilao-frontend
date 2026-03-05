import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule, ButtonModule, FormModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-subform',
  standalone: true,
  imports: [CommonModule, ModalModule, ButtonModule, FormModule, FontAwesomeModule],
  templateUrl: './subform.component.html',
})
export class SubformComponent {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = 'Selecione...';
  @Input() modalTitle = 'Cadastrar / Detalhes';
  @Input() displayValue = ''; // O nome que aparece no input

  visible = false;
  faSearchPlus = faSearchPlus;

  setModal(status: boolean) {
    this.visible = status;
  }
}
