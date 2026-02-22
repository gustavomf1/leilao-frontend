import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LeilaoService } from '../../../core/services/leilao.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-leiloes-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './leilao-details.component.html',
})
export class LeiloesDetailsComponent implements OnInit {
  private service = inject(LeilaoService);
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
      local:        ['', Validators.required],
      uf:           ['', [Validators.required, Validators.maxLength(2)]],
      cidade:       ['', Validators.required],
      descricao:    ['', Validators.required],
      data:         ['', Validators.required],
      condicoes_id: [null],
      taxas_id:     [null]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.alert.error('Erro ao carregar leilão')
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
          this.alert.success(this.isEdicao ? 'Leilão atualizado!' : 'Leilão cadastrado!');
          this.router.navigate(['/leiloes/lista']);
        },
        error: () => this.alert.error('Erro ao salvar leilão')
      });
    }
  }
}
