import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-especie-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './especie-details.component.html',
})
export class EspecieDetailsComponent implements OnInit {
  private service = inject(EspecieService);
  private alert = inject(AlertService);

  faSave = faSave;
  faArrowLeft = faArrowLeft;

  form!: FormGroup;
  isEdicao = false;
  private entityId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(50)]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar espécie'),
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
          this.alert.success(this.isEdicao ? 'Espécie atualizada!' : 'Espécie cadastrada!');
          this.router.navigate(['/especies/lista']);
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar espécie'),
      });
    }
  }
}
