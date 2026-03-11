import { Component, inject, Type, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faCheck, faPlus, faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FazendaService } from '../../../core/services/fazenda.service';
import { SubformService } from '../../services/subform.service';

@Component({
  selector: 'app-fazenda-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './fazenda-picker.component.html',
})
export class FazendaPickerComponent {
  private fazendaService = inject(FazendaService);
  private subformService = inject(SubformService);
  private cdr = inject(ChangeDetectorRef);

  faSearch = faSearch;
  faCheck = faCheck;
  faPlus = faPlus;
  faCircleNotch = faCircleNotch;
  faTimes = faTimes;

  busca = '';
  fazendas: any[] = [];
  carregando = false;
  buscaFeita = false;
  mostrarCadastro = false;
  fazendasDetailsComponent?: Type<any>;

  private buscaSubject = new Subject<string>();

  constructor() {
    import('../../../components/fazenda/fazenda-details/fazenda-details.component').then(m => {
      this.fazendasDetailsComponent = m.FazendasDetailsComponent;
    });

    this.buscaSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((nome) => {
        this.carregando = true;
        return this.fazendaService.buscarPorNome(nome);
      })
    ).subscribe({
      next: (data) => {
        this.fazendas = data;
        this.carregando = false;
        this.buscaFeita = true;
      },
      error: () => this.carregando = false
    });
  }

  onBusca() {
    if (this.busca.trim().length >= 2) {
      this.buscaSubject.next(this.busca);
    } else {
      this.fazendas = [];
      this.buscaFeita = false;
    }
  }

  selecionar(fazenda: any) {
    this.subformService.emitir('fazenda', fazenda);
  }

  toggleCadastro() {
    this.mostrarCadastro = !this.mostrarCadastro;
  }
}