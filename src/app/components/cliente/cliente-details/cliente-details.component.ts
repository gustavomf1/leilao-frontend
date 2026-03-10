import { Component, OnInit, OnDestroy, inject, Output, EventEmitter, Input, ViewChild, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SubformService } from '../../../shared/services/subform.service';
import { SubformComponent } from '../../../shared/components/subform/subform.component';

@Component({
  selector: 'app-clientes-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule,
    SubformComponent],
  templateUrl: './cliente-details.component.html',
})
export class ClientesDetailsComponent implements OnInit, OnDestroy {
  private service = inject(ClienteService);
  private alert = inject(AlertService);
  private subformService = inject(SubformService);

  @Input() modoSubform = false;
  @Output() aoSalvar = new EventEmitter<any>();
  @ViewChild('pickerFazenda') pickerFazenda!: SubformComponent;

  faSave = faSave;
  faArrowLeft = faArrowLeft;
  form!: FormGroup;
  isEdicao = false;
  private entityId?: number;
  nomeFazendaSelecionada = '';
  fazendasDetailsComponent?: Type<any>;
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      nome:      ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      cpf:       ['', Validators.required],
      telefone:  ['', Validators.required],
      cidade:    ['', Validators.required],
      uf:        ['', [Validators.required, Validators.maxLength(2)]],
      rg:        ['', Validators.required],
      fazendaId: [null]
    });

    // lazy load para evitar dependência circular
    const m = await import('../../fazenda/fazenda-details/fazenda-details.component');
    this.fazendasDetailsComponent = m.FazendasDetailsComponent;

    this.sub = this.subformService.resultado$.subscribe(({ chave, dados }) => {
      if (chave === 'fazenda') {
        this.form.patchValue({ fazendaId: dados.id });
        this.nomeFazendaSelecionada = dados.nome;
        this.pickerFazenda?.setModal(false);
      }
    });

    if (!this.modoSubform) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEdicao = true;
        this.entityId = +id;
        this.service.buscarPorId(this.entityId).subscribe({
          next: (data) => this.form.patchValue(data),
          error: () => this.alert.error('Erro ao carregar cliente')
        });
      }
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: (res) => {
          this.alert.success(this.isEdicao ? 'Cliente atualizado!' : 'Cliente cadastrado!');
          if (this.modoSubform) {
            this.subformService.emitir('titular', res);
          } else {
            this.aoSalvar.emit(res);
            if (!this.aoSalvar.observed) {
              this.router.navigate(['/clientes/lista']);
            }
          }
        },
        error: () => this.alert.error('Erro ao salvar cliente')
      });
    }
  }
}