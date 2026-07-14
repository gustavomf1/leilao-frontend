import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoteFoto } from '../../../core/services/lote-foto.service';

@Component({
  selector: 'app-lote-fotos-galeria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lote-fotos-galeria.component.html',
  styleUrl: './lote-fotos-galeria.component.css'
})
export class LoteFotosGaleriaComponent {
  @Input() fotos: LoteFoto[] = [];

  abrir(foto: LoteFoto) {
    window.open(foto.viewUrl, '_blank');
  }
}
