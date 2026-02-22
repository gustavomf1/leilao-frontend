import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-funcionarios-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './funcionario-details.component.html',
})
export class FuncionariosDetailsComponent implements OnInit {
  private service = inject(FuncionarioService);
  private alert = inject(AlertService);

  faSave = faSave;
  faArrowLeft = faArrowLeft;

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
      nome:  ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf:   ['', Validators.required],
      senha: ['', this.isEdicao ? [] : [Validators.required, Validators.minLength(6)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      // Em edição, senha não é obrigatória
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity();
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.alert.error('Erro ao carregar funcionário')
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      // Se edição e senha vazia, não enviar campo senha
      if (this.isEdicao && !dados.senha) {
        delete dados.senha;
      }
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: () => {
          this.alert.success(this.isEdicao ? 'Funcionário atualizado!' : 'Funcionário cadastrado!');
          this.router.navigate(['/funcionarios/lista']);
        },
        error: () => this.alert.error('Erro ao salvar funcionário')
      });
    }
  }
}
