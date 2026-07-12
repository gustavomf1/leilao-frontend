import { ChangeDetectorRef, Component, OnInit, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  TableModule, TableDirective, CardBodyComponent, CardComponent,
  ButtonDirective, ModalModule, FormModule, BadgeComponent
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPencil, faTrash, faKey, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { Cliente, Pix } from '../../../core/models/entities.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { PixService } from '../../../core/services/pix.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientesDetailsComponent } from '../cliente-details/cliente-details.component';
import { PaginacaoComponent } from '../../../shared/components/paginacao/paginacao.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TableModule, TableDirective, ButtonDirective,
    CardBodyComponent, CardComponent, ModalModule,
    FormModule, BadgeComponent, FontAwesomeModule,
    ClientesDetailsComponent, PaginacaoComponent
  ],
  templateUrl: './cliente-list.component.html'
})
export class ClientesListComponent implements OnInit {
  private service = inject(ClienteService);
  private pixService = inject(PixService);
  private alert = inject(AlertService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  faKey = faKey;
  faXmark = faXmark;

  clientes$ = new BehaviorSubject<Cliente[]>([]);

  paginaAtual = 0;
  tamanhoPagina = 20;
  totalPaginas = 0;
  totalElementos = 0;
  termoBusca = '';

  // Drawer
  drawerAberto = false;
  drawerClienteId?: number;

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
    this.service.listarPaginado(this.paginaAtual, this.tamanhoPagina, this.termoBusca || undefined).subscribe({
      next: (pagina) => this.zone.run(() => {
        this.clientes$.next(pagina.content);
        this.totalPaginas = pagina.totalPages;
        this.totalElementos = pagina.totalElements;
      }),
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar clientes')
    });
  }

  onBuscaMudou(termo: string) {
    this.termoBusca = termo;
    this.paginaAtual = 0;
    this.carregar();
  }

  onTamanhoMudou(tamanho: number) {
    this.tamanhoPagina = tamanho;
    this.paginaAtual = 0;
    this.carregar();
  }

  onPaginaMudou(pagina: number) {
    this.paginaAtual = pagina;
    this.carregar();
  }

  abrirDrawerNovo() {
    this.drawerClienteId = undefined;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  abrirDrawerEditar(id: number) {
    this.drawerClienteId = id;
    this.drawerAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    this.drawerAberto = false;
    document.body.style.overflow = '';
  }

  onClienteSalvo() {
    this.fecharDrawer();
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.drawerAberto) this.fecharDrawer();
  }

  deletar(id: number) {
    this.alert.confirm('Deseja realmente excluir este cliente?', () => {
      this.service.deletar(id).subscribe({
        next: () => {
          this.alert.success('Cliente excluído!');
          this.carregar();
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir cliente')
      });
    });
  }

  abrirModalPix(cliente: Cliente) {
    this.clienteSelecionado = cliente;
    this.novoPix = { tipo: 'CPF_CNPJ', chave: '' };
    this.pixService.listarPorUsuario(cliente.id!).subscribe({
      next: (data) => { this.pixKeys = data; this.cdr.detectChanges(); },
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar chaves Pix')
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
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao adicionar chave Pix')
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
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao remover chave Pix')
      });
    });
  }
}
