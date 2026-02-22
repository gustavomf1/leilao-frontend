import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule,
  GridModule
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-usuarios-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './usuario-details.component.html',
  styleUrl: './usuario-details.component.scss'
})
export class UsuariosDetailsComponent implements OnInit {
  private service = inject(UsuarioService);
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
      senha: ['', [Validators.required, Validators.minLength(6)]],
      cpf:   ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.alert.error('Erro ao carregar usuário')
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: () => {
          this.alert.success(this.isEdicao ? 'Usuário atualizado!' : 'Usuário cadastrado!');
          this.router.navigate(['/usuarios/lista']);
        },
        error: () => this.alert.error('Erro ao salvar usuário')
      });
    }
  }
}