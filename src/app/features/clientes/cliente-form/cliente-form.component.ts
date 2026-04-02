import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SubformComponent } from '../../shared-components/subform/subform.component';
import { FazendaFormComponent } from '../../fazendas/fazenda-form/fazenda-form.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SubformComponent,
    NgxMaskDirective // 👈 ISSO AQUI É O QUE ESTÁ FALTANDO
  ], templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private alert = inject(AlertService);
  form!: FormGroup;
  isEdicao = false;
  clienteId?: number;

  estados: string[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email:  [''],
      cpf: ['', Validators.required],
      telefone: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
      fazendas: this.fb.array([]) // 👈 FORM ARRAY
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.clienteId = +id;
      this.clienteService.buscarPorId(this.clienteId).subscribe({
        next: (cliente) => this.form.patchValue(cliente),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar cliente')
      });
    }
  }

  get fazendas(): FormArray {
    return this.form.get('fazendas') as FormArray;
  }

  abrirDialogFazenda() {
    const dialogRef = this.dialog.open(FazendaFormComponent, {
      width: '900px',
      panelClass: 'fazenda-dialog'
    });

    dialogRef.afterClosed().subscribe((fazendaCriada) => {
      if (fazendaCriada) {
        this.fazendas.push(this.fb.control(fazendaCriada));
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cliente = this.form.value;

    if (this.isEdicao && this.clienteId) {
      this.clienteService.atualizar(this.clienteId, cliente).subscribe({
        next: () => this.router.navigate(['/app/clientes']),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao atualizar cliente')
      });
    } else {
      this.clienteService.salvar(cliente).subscribe({
        next: () => this.router.navigate(['/app/clientes']),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao salvar cliente')
      });
    }
  }

  voltar(): void {
    this.router.navigate(['/app/clientes']);
  }
}
