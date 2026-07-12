import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormModule, PaginationModule } from '@coreui/angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-paginacao',
  standalone: true,
  imports: [CommonModule, FormsModule, FormModule, PaginationModule],
  templateUrl: './paginacao.component.html'
})
export class PaginacaoComponent implements OnDestroy {
  @Input() paginaAtual = 0;
  @Input() totalPaginas = 0;
  @Input() tamanhoPagina = 20;

  @Output() buscaMudou = new EventEmitter<string>();
  @Output() tamanhoMudou = new EventEmitter<number>();
  @Output() paginaMudou = new EventEmitter<number>();

  termoBusca = '';
  tamanhosDisponiveis = [20, 50, 100];

  private buscaSubject = new Subject<string>();
  private buscaSubscription: Subscription;

  constructor() {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((termo) => this.buscaMudou.emit(termo));
  }

  ngOnDestroy() {
    this.buscaSubscription.unsubscribe();
  }

  onBuscaDigitada() {
    this.buscaSubject.next(this.termoBusca);
  }

  onTamanhoAlterado(tamanho: string) {
    this.tamanhoMudou.emit(Number(tamanho));
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina >= this.totalPaginas) {
      return;
    }
    this.paginaMudou.emit(pagina);
  }
}
