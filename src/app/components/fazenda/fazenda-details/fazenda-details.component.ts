import { Component, OnInit, OnDestroy, inject, Output, EventEmitter, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { FazendaService } from '../../../core/services/fazenda.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SubformService } from '../../../shared/services/subform.service';
import { SubformComponent } from '../../../shared/components/subform/subform.component';
import { ClientePickerComponent } from '../../../shared/components/cliente-picker/cliente-picker.component';
import { ClienteService } from '../../../core/services/cliente.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-fazendas-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule,
    SubformComponent, ClientePickerComponent, NgxMaskDirective],
  templateUrl: './fazenda-details.component.html',
})
export class FazendasDetailsComponent implements OnInit, OnDestroy {
  private service = inject(FazendaService);
  private alert = inject(AlertService);
  private subformService = inject(SubformService);
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  @Input() modoSubform = false;
  @Input() ocultarTitular = false;
  @Output() aoSalvar = new EventEmitter<any>();
  @ViewChild('pickerTitular') pickerTitular!: SubformComponent;

  faSave = faSave;
  faArrowLeft = faArrowLeft;
  form!: FormGroup;
  isEdicao = false;
  private entityId?: number;
  nomeTitularSelecionado = '';
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      inscricao: ['', Validators.required],
      nome:      ['', Validators.required],
      uf:        ['', [Validators.required, Validators.maxLength(2)]],
      cidade:    ['', Validators.required],
      cnpj:      ['', Validators.required],
      titularId: [null]
    });

    this.sub = this.subformService.resultado$.subscribe(({ chave, dados }) => {
      if (chave === 'titular') {
        this.form.patchValue({ titularId: dados.id });
        this.nomeTitularSelecionado = dados.nome;
        this.pickerTitular?.setModal(false);
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => {
          this.form.patchValue(data);
          if (data.titularId) {
            this.clienteService.buscarPorId(data.titularId).subscribe({
              next: (cliente) => {
                this.nomeTitularSelecionado = cliente.nome;
                this.cdr.detectChanges();
              }
            });
          }
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar fazenda')
      });
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
          this.alert.success(this.isEdicao ? 'Fazenda atualizada!' : 'Fazenda cadastrada!');
          if (this.modoSubform) {
            this.subformService.emitir('fazenda', res);
          } else {
            this.aoSalvar.emit(res);
            if (!this.aoSalvar.observed) {
              this.router.navigate(['/fazendas/lista']);
            }
          }
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar fazenda')
      });
    }
  }
}