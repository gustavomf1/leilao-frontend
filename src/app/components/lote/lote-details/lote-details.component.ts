import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LoteService } from '../../../core/services/lote.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lotes-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './lote-details.component.html',
})
export class LotesDetailsComponent implements OnInit {
  private service = inject(LoteService);
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
      codigo:           ['', Validators.required],
      qntd_animais:     [1, [Validators.required, Validators.min(1)]],
      sexo:             ['', Validators.required],
      idade_em_meses:   [0, [Validators.required, Validators.min(0)]],
      peso:             [0, [Validators.required, Validators.min(0)]],
      raca:             ['', Validators.required],
      especie:          ['', Validators.required],
      categoria_animal: ['', Validators.required],
      obs:              [''],
      leilao_id:        [null],
      vendedor_id:      [null],
      comprador_id:     [null],
      preco_compra:     [0, [Validators.required, Validators.min(0)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.alert.error('Erro ao carregar lote')
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
          this.alert.success(this.isEdicao ? 'Lote atualizado!' : 'Lote cadastrado!');
          this.router.navigate(['/lotes/lista']);
        },
        error: () => this.alert.error('Erro ao salvar lote')
      });
    }
  }
}
