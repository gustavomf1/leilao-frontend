import { Component, inject, Type, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faCheck, faPlus, faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ClienteService } from '../../../core/services/cliente.service';
import { SubformService } from '../../services/subform.service';

@Component({
  selector: 'app-cliente-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './cliente-picker.component.html',
})
export class ClientePickerComponent {
  private clienteService = inject(ClienteService);
  private subformService = inject(SubformService);
  private cdr = inject(ChangeDetectorRef);

  faSearch = faSearch;
  faCheck = faCheck;
  faPlus = faPlus;
  faCircleNotch = faCircleNotch;
  faTimes = faTimes;

  busca = '';
  clientes: any[] = [];
  carregando = false;
  buscaFeita = false;
  mostrarCadastro = false;
  clientesDetailsComponent?: Type<any>;

  private buscaSubject = new Subject<string>();

  constructor() {
    import('../../../components/cliente/cliente-details/cliente-details.component').then(m => {
      this.clientesDetailsComponent = m.ClientesDetailsComponent;
    });

    this.buscaSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((nome) => {
        this.carregando = true;
        return this.clienteService.buscarPorNome(nome);
      })
    ).subscribe({
      next: (data) => {
        this.clientes = data;
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
      this.clientes = [];
      this.buscaFeita = false;
    }
  }

  selecionar(cliente: any) {
    this.subformService.emitir('titular', cliente);
  }

  toggleCadastro() {
    this.mostrarCadastro = !this.mostrarCadastro;
  }
}