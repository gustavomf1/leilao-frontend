import { Component, OnInit, OnDestroy, inject, Output, EventEmitter, Input, ViewChild, ChangeDetectorRef, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faUser, faMapMarkerAlt, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SubformService } from '../../../shared/services/subform.service';
import { SubformComponent } from '../../../shared/components/subform/subform.component';
import { FazendaService } from '../../../core/services/fazenda.service';
import { NgxMaskDirective } from 'ngx-mask';
import { UF_LIST } from '../../../core/constants/uf.constant';

@Component({
  selector: 'app-clientes-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule,
    SubformComponent, NgxMaskDirective],
  templateUrl: './cliente-details.component.html',
})
export class ClientesDetailsComponent implements OnInit, OnDestroy {
  private service = inject(ClienteService);
  private alert = inject(AlertService);
  private subformService = inject(SubformService);
  private fazendaService = inject(FazendaService);
  private cdr = inject(ChangeDetectorRef);

  @Input() modoSubform = false;
  @Input() modoDrawer = false;
  @Input() drawerEntityId?: number;
  @Output() aoSalvar = new EventEmitter<any>();
  @ViewChild('pickerFazenda') pickerFazenda!: SubformComponent;

  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faUser = faUser;
  faMapMarker = faMapMarkerAlt;
  faBullhorn = faBullhorn;
  ufs = UF_LIST;
  form!: FormGroup;
  isEdicao = false;

  readonly ddiOptions = [
    { label: 'Brasil (+55)', value: '55' },
    { label: 'Argentina (+54)', value: '54' },
    { label: 'Paraguai (+595)', value: '595' },
    { label: 'Uruguai (+598)', value: '598' },
    { label: 'Bolívia (+591)', value: '591' },
    { label: 'EUA (+1)', value: '1' },
    { label: 'Portugal (+351)', value: '351' },
    { label: 'Outro', value: 'outro' },
  ];

  get isBrazilianDdi(): boolean {
    return this.form?.get('ddi')?.value === '55';
  }
  private entityId?: number;
  nomeFazendaSelecionada = '';
  fazendaPickerComponent?: Type<any>;
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    import('../../../shared/components/fazenda-picker/fazenda-picker.component').then(m => {
      this.fazendaPickerComponent = m.FazendaPickerComponent;
    });

    this.form = this.fb.group({
      nome:      ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      pessoa:    ['F', Validators.required],
      cpfCnpj:   ['', Validators.required],
      ddi:       ['55', Validators.required],
      telefone:  ['', Validators.required],
      cidade:    ['', Validators.required],
      uf:        ['', [Validators.required, Validators.maxLength(2)]],
      rg:        ['', Validators.required],
      fazendaId: [null],
      usu_aceita_remarketing: [false]
    });

    this.sub = this.subformService.resultado$.subscribe(({ chave, dados }) => {
      if (chave === 'fazenda') {
        this.form.patchValue({ fazendaId: dados.id });
        this.nomeFazendaSelecionada = dados.nome;
        this.pickerFazenda?.setModal(false);
      }
    });

    if (!this.modoSubform) {
      const routeId = this.route.snapshot.paramMap.get('id');
      const id = this.drawerEntityId ?? (routeId ? +routeId : null);
      if (id) {
        this.isEdicao = true;
        this.entityId = id;
        this.form.get('cpfCnpj')?.disable();
        this.service.buscarPorId(this.entityId).subscribe({
          next: (data) => {
            this.form.patchValue(data);
            if (data.fazendaId) {
              this.fazendaService.buscarPorId(data.fazendaId).subscribe({
                next: (fazenda) => {
                  this.nomeFazendaSelecionada = fazenda.nome;
                  this.cdr.detectChanges();
                }
              });
            }
          },
          error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar cliente')
        });
      }
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dados = this.form.getRawValue();
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: (res) => {
          if (dados.fazendaId && !this.isEdicao) {
            this.fazendaService.buscarPorId(dados.fazendaId).subscribe({
              next: (fazenda) => {
                this.fazendaService.atualizar(dados.fazendaId, {
                  ...fazenda,
                  titularId: res.id
                }).subscribe();
              }
            });
          }

          this.alert.success(this.isEdicao ? 'Cliente atualizado!' : 'Cliente cadastrado!');
          if (this.modoSubform) {
            this.subformService.emitir('titular', res);
          } else if (this.modoDrawer || this.aoSalvar.observed) {
            this.aoSalvar.emit(res);
          } else {
            this.router.navigate(['/clientes/lista']);
          }
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar cliente')
      });
  }
}