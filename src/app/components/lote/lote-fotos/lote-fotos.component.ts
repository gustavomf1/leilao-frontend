import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectorRef, DestroyRef, inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { UploadQueueService, QueueItem } from '../../../core/services/upload-queue.service';
import { LoteFotoService, LoteFoto } from '../../../core/services/lote-foto.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lote-fotos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lote-fotos.component.html',
  styleUrl: './lote-fotos.component.css'
})
export class LoteFotosComponent implements OnInit, OnChanges {
  @Input() loteId!: number;

  private queue = inject(UploadQueueService);
  private fotoService = inject(LoteFotoService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private alert = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  queueItems: QueueItem[] = [];
  confirmedFotos: LoteFoto[] = [];

  get totalFotos(): number {
    return this.queueItems.filter(i => i.status !== 'DONE').length + this.confirmedFotos.length;
  }

  get seletorDesabilitado(): boolean {
    return this.totalFotos >= 20;
  }

  ngOnInit() {
    this.queue.queue$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
      this.queueItems = items.filter(i => i.loteId === this.loteId);
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loteId']?.currentValue) {
      this.carregarFotosConfirmadas();
    }
  }

  carregarFotosConfirmadas() {
    this.fotoService.listar(this.loteId).subscribe({
      next: fotos => {
        this.confirmedFotos = fotos;
        this.cdr.markForCheck();
      },
      error: () => this.alert.error('Erro ao carregar fotos')
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const MAX_SIZE = 15 * 1024 * 1024;
    const selected = Array.from(input.files).slice(0, 20 - this.totalFotos);
    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        this.alert.error(`"${file.name}" excede o limite de 15 MB.`);
        continue;
      }
      this.queue.enqueue(this.loteId, file);
    }
    input.value = '';
  }

  retry(uuid: string) {
    this.queue.retryItem(uuid);
  }

  deletarConfirmada(foto: LoteFoto) {
    this.alert.confirm(`Excluir esta foto?`, () => {
      this.fotoService.deletar(this.loteId, foto.id).subscribe({
        next: () => {
          this.confirmedFotos = this.confirmedFotos.filter(f => f.id !== foto.id);
          this.cdr.markForCheck();
        },
        error: () => this.alert.error('Erro ao excluir foto')
      });
    });
  }

  podeEditar(): boolean {
    return this.auth.isAdmin() || this.auth.hasPermission('LOTES', 'EDITAR');
  }
}
