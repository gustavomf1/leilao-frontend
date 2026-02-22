import { Component } from '@angular/core';
import {
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  imports: [ContainerComponent, RowComponent, ColComponent]
})
export class Page404Component {}
