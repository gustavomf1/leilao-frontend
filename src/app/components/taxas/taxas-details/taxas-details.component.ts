import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule, ButtonDirective, FormModule, GridModule } from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faDollarSign, faPercent } from '@fortawesome/free-solid-svg-icons';
import { TaxasService } from '../../../core/services/taxas.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-taxas-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardModule, ButtonDirective, FormModule, GridModule, FontAwesomeModule],
  templateUrl: './taxas-details.component.html',
})
export class TaxasDetailsComponent implements OnInit {
  private service = inject(TaxasService);
  private alert = inject(AlertService);

  @Input() modoDrawer = false;
  @Output() aoSalvar = new EventEmitter<any>();

  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faDollarSign = faDollarSign;
  faPercent = faPercent;

  form!: FormGroup;
  isEdicao = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      taxa:          [0, [Validators.required, Validators.min(0)]],
      comissaoVenda: [0, [Validators.required, Validators.min(0)]],
      comissaoCompra:[0, [Validators.required, Validators.min(0)]],
      gta:           [0, [Validators.required, Validators.min(0)]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.service.obterAtual().subscribe({
        next: (data) => this.form.patchValue(data),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar taxa padrão'),
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = this.form.getRawValue();
      this.service.salvar(dados).subscribe({
        next: (res) => {
          this.alert.success('Nova taxa padrão cadastrada!');
          if (this.modoDrawer || this.aoSalvar.observed) {
            this.aoSalvar.emit(res);
          } else {
            this.router.navigate(['/taxas/lista']);
          }
        },
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar taxa padrão'),
      });
    }
  }
}
