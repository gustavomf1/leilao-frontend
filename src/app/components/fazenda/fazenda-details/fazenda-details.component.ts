import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FazendaService } from '../../../core/services/fazenda.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-fazendas-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './fazenda-details.component.html',
})
export class FazendasDetailsComponent implements OnInit {
  private service = inject(FazendaService);
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
      inscricao:  ['', Validators.required],
      nome:       ['', Validators.required],
      uf:         ['', [Validators.required, Validators.maxLength(2)]],
      cidade:     ['', Validators.required],
      cnpj:       ['', Validators.required],
      titular_id: [null]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.alert.error('Erro ao carregar fazenda')
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
          this.alert.success(this.isEdicao ? 'Fazenda atualizada!' : 'Fazenda cadastrada!');
          this.router.navigate(['/fazendas/lista']);
        },
        error: () => this.alert.error('Erro ao salvar fazenda')
      });
    }
  }
}
