import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  FormControlDirective,
  FormDirective
} from '@coreui/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CardComponent,
    CardBodyComponent,
    FormDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    RouterLink
  ]
})
export class RegisterComponent {}
