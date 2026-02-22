import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-clientes-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './cliente-details.component.html',
})
export class ClientesDetailsComponent implements OnInit {
  private service = inject(ClienteService);
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
      nome:     ['', Validators.required],
      cpf:      ['', Validators.required],
      telefone: ['', Validators.required],
      cidade:   ['', Validators.required],
      uf:       ['', [Validators.required, Validators.maxLength(2)]],
      rg:       ['', Validators.required],
      fazenda_id: [null]
    });

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

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      const op = this.isEdicao
        ? this.service.atualizar(this.entityId!, dados)
        : this.service.salvar(dados);

      op.subscribe({
        next: () => {
          this.alert.success(this.isEdicao ? 'Cliente atualizado!' : 'Cliente cadastrado!');
          this.router.navigate(['/clientes/lista']);
        },
        error: () => this.alert.error('Erro ao salvar cliente')
      });
    }
  }
}
