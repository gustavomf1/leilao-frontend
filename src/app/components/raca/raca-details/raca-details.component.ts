import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RacaService } from '../../../core/services/raca.service';
import { EspecieService } from '../../../core/services/especie.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Especie } from '../../../core/models/entities.model';

@Component({
  selector: 'app-raca-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './raca-details.component.html',
})
export class RacaDetailsComponent implements OnInit {
  private service = inject(RacaService);
  private especieService = inject(EspecieService);
  private alert = inject(AlertService);

  faSave = faSave;
  faArrowLeft = faArrowLeft;

  form!: FormGroup;
  especies: Especie[] = [];
  isEdicao = false;
  private entityId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(80)]],
      especieId: [null, Validators.required],
    });

    this.especieService.listar().subscribe({
      next: (data) => this.especies = data,
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar especies'),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.entityId = +id;
      this.service.buscarPorId(this.entityId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar raca'),
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
          this.alert.success(this.isEdicao ? 'Raca atualizada!' : 'Raca cadastrada!');
          this.router.navigate(['/racas/lista']);
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar raca'),
      });
    }
  }
}
