import { ChangeDetectorRef, Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  TableModule, TableDirective, CardBodyComponent, CardComponent,
  ButtonDirective, ModalModule, FormModule, BadgeComponent
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faKey } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Cliente, Pix } from '../../../core/models/entities.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { PixService } from '../../../core/services/pix.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TableModule, TableDirective, ButtonDirective,
    CardBodyComponent, CardComponent, ModalModule,
    FormModule, BadgeComponent, FontAwesomeModule
  ],
  templateUrl: './cliente-list.component.html'
})
export class ClientesListComponent implements OnInit {
  private service = inject(ClienteService);
  private pixService = inject(PixService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faKey = faKey;

  clientes$ = new BehaviorSubject<Cliente[]>([]);

  // Modal Pix
  modalPixVisivel = false;
  clienteSelecionado: Cliente | null = null;
  pixKeys: Pix[] = [];
  novoPix: Pix = { tipo: 'CPF_CNPJ', chave: '' };
  tiposPix = ['CPF_CNPJ', 'TELEFONE', 'EMAIL', 'CHAVE_ALEATORIA'];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.clientes$.next(data)),
      error: () => this.alert.error('Erro ao carregar clientes')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este cliente?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Cliente excluído!');
          this.clientes$.next(this.clientes$.value.filter(c => c.id !== id));
        },
        error: () => this.alert.error('Erro ao excluir cliente')
      });
    });
  }

  abrirModalPix(cliente: Cliente) {
    this.clienteSelecionado = cliente;
    this.novoPix = { tipo: 'CPF_CNPJ', chave: '' };
    this.pixService.listarPorUsuario(cliente.id!).subscribe({
      next: (data) => { this.pixKeys = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar chaves Pix')
    });
    this.modalPixVisivel = true;
  }

  fecharModalPix() {
    this.modalPixVisivel = false;
    this.clienteSelecionado = null;
    this.pixKeys = [];
  }

  adicionarPix() {
    if (!this.novoPix.chave.trim()) {
      this.alert.error('Informe a chave Pix');
      return;
    }
    const payload: Pix = {
      tipo: this.novoPix.tipo,
      chave: this.novoPix.chave,
      usuarioId: this.clienteSelecionado!.id
    };
    this.pixService.cadastrar(payload).subscribe({
      next: () => {
        this.alert.success('Chave Pix adicionada!');
        this.novoPix = { tipo: 'CPF_CNPJ', chave: '' };
        this.pixService.listarPorUsuario(this.clienteSelecionado!.id!).subscribe({
          next: (data) => { this.pixKeys = data; this.cdr.detectChanges(); }
        });
      },
      error: () => this.alert.error('Erro ao adicionar chave Pix')
    });
  }

  deletarPix(pixId: number) {
    this.alert.confirm('Deseja remover esta chave Pix?', () => {
      this.pixService.deletar(pixId).subscribe({
        next: () => {
          this.alert.success('Chave removida!');
          this.pixKeys = this.pixKeys.filter(p => p.pixId !== pixId);
          this.cdr.detectChanges();
        },
        error: () => this.alert.error('Erro ao remover chave Pix')
      });
    });
  }
}
