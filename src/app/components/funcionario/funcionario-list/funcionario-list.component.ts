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
import { Funcionario, Pix } from '../../../core/models/entities.model';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { PixService } from '../../../core/services/pix.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-funcionarios-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TableModule, TableDirective, ButtonDirective,
    CardBodyComponent, CardComponent, ModalModule,
    FormModule, BadgeComponent, FontAwesomeModule
  ],
  templateUrl: './funcionario-list.component.html'
})
export class FuncionariosListComponent implements OnInit {
  private service = inject(FuncionarioService);
  private pixService = inject(PixService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faKey = faKey;

  funcionarios$ = new BehaviorSubject<Funcionario[]>([]);

  // Modal Pix
  modalPixVisivel = false;
  funcionarioSelecionado: Funcionario | null = null;
  pixKeys: Pix[] = [];
  novoPix: Pix = { tipo: 'CPF_CNPJ', chave: '' };
  tiposPix = ['CPF_CNPJ', 'TELEFONE', 'EMAIL', 'CHAVE_ALEATORIA'];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (data) => this.zone.run(() => this.funcionarios$.next(data)),
      error: () => this.alert.error('Erro ao carregar funcionários')
    });
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este funcionário?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Funcionário excluído!');
          this.funcionarios$.next(this.funcionarios$.value.filter(f => f.id !== id));
        },
        error: () => this.alert.error('Erro ao excluir funcionário')
      });
    });
  }

  abrirModalPix(funcionario: Funcionario) {
    this.funcionarioSelecionado = funcionario;
    this.novoPix = { tipo: 'CPF_CNPJ', chave: '' };
    this.carregarPix(funcionario.id!);
    this.modalPixVisivel = true;
  }

  fecharModalPix() {
    this.modalPixVisivel = false;
    this.funcionarioSelecionado = null;
    this.pixKeys = [];
  }

  carregarPix(usuarioId: number) {
    this.pixService.listarPorUsuario(usuarioId).subscribe({
      next: (data) => { this.pixKeys = data; this.cdr.detectChanges(); },
      error: () => this.alert.error('Erro ao carregar chaves Pix')
    });
  }

  adicionarPix() {
    if (!this.novoPix.chave.trim()) {
      this.alert.error('Informe a chave Pix');
      return;
    }
    const payload: Pix = {
      tipo: this.novoPix.tipo,
      chave: this.novoPix.chave,
      usuarioId: this.funcionarioSelecionado!.id
    };
    this.pixService.cadastrar(payload).subscribe({
      next: () => {
        this.alert.success('Chave Pix adicionada!');
        this.novoPix = { tipo: 'CPF_CNPJ', chave: '' };
        this.carregarPix(this.funcionarioSelecionado!.id!);
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
