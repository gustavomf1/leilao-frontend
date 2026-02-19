import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
      cpf: ['', Validators.required],
      rg: [''],
      telefone: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
      fazenda_id: [null]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.clienteId = +id;
      this.clienteService.buscarPorId(this.clienteId).subscribe({
        next: (cliente) => this.form.patchValue(cliente),
        error: (err) => console.error('Erro ao carregar cliente:', err)
      });
    }
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
        error: (err) => console.error('Erro ao atualizar cliente:', err)
      });
    } else {
      this.clienteService.salvar(cliente).subscribe({
        next: () => this.router.navigate(['/app/clientes']),
        error: (err) => console.error('Erro ao salvar cliente:', err)
      });
    }
  }

  voltar(): void {
    this.router.navigate(['/app/clientes']);
  }
}
