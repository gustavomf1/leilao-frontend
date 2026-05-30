import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faIdCard, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { AlertService } from '../../../shared/services/alert.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-funcionarios-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule, NgxMaskDirective],
  templateUrl: './funcionario-details.component.html',
})
export class FuncionariosDetailsComponent implements OnInit {
  private service = inject(FuncionarioService);
  private alert = inject(AlertService);

  @Input() modoDrawer = false;
  @Input() drawerEntityId?: number;
  @Output() aoSalvar = new EventEmitter<any>();

  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faIdCard = faIdCard;
  faShieldAlt = faShieldAlt;

  form!: FormGroup;
  isEdicao = false;
  private entityId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      cpf:      ['', Validators.required],
      senha:    ['', this.isEdicao ? [] : [Validators.required, Validators.minLength(6)]],
      isManejo: [false]
    });

    const routeId = this.route.snapshot.paramMap.get('id');
    const id = this.drawerEntityId ?? (routeId ? +routeId : null);
    if (id) {
      this.isEdicao = true;
      this.entityId = id;
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity();
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar funcionário')
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      if (this.isEdicao && !dados.senha) delete dados.senha;
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: (res) => {
          this.alert.success(this.isEdicao ? 'Funcionário atualizado!' : 'Funcionário cadastrado!');
          if (this.modoDrawer || this.aoSalvar.observed) {
            this.aoSalvar.emit(res);
          } else {
            this.router.navigate(['/funcionarios/lista']);
          }
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar funcionário')
      });
    }
  }
}
