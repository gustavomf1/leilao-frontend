import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-subform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subform.component.html',
  styleUrl: './subform.component.css'
})
export class SubformComponent {

  @Input() label = '';
  @Input() formArray!: FormArray;
  @Input() displayField = 'nome';
  @Output() create = new EventEmitter<void>();

  remover(index: number) {
    this.formArray.removeAt(index);
  }


}

