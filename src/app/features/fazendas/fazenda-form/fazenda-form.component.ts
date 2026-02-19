import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FazendaService } from '../../../core/services/fazenda.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Optional, Inject } from '@angular/core';

@Component({
  selector: 'app-fazenda-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './fazenda-form.component.html',
  styleUrl: './fazenda-form.component.css'
})
export class FazendaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fazendaService = inject(FazendaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private dialogRef = inject(MatDialogRef<FazendaFormComponent>, { optional: true });
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  editando = false;
  fazendaId?: number;

  form = this.fb.group({
    inscricao: ['', Validators.required],
    nome: ['', Validators.required],
    cnpj: ['', Validators.required],
    cidade: ['', Validators.required],
    uf: ['', Validators.required],
    titular_id: [null as number | null]
  });


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.fazendaId = +id;
      this.fazendaService.buscarPorId(this.fazendaId).subscribe({
        next: (fazenda) => {
          this.form.patchValue({
            inscricao: fazenda.inscricao,
            nome: fazenda.nome,
            cnpj: fazenda.cnpj,
            cidade: fazenda.cidade,
            uf: fazenda.uf,
            titular_id: fazenda.titular_id ?? null
          });
        },
        error: (err) => {
          console.error('Erro ao carregar fazenda:', err);
          alert('Erro ao carregar fazenda.');
          this.voltar();
        }
      });
    }
  }

  get isDialog(): boolean {
    return !!this.dialogRef;
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const dados = this.form.getRawValue() as any;

    if (this.editando && this.fazendaId) {
      this.fazendaService.atualizar(this.fazendaId, dados).subscribe({
        next: (fazendaAtualizada) => {
          if (this.isDialog) {
            this.dialogRef?.close(fazendaAtualizada);
          } else {
            this.voltar();
          }
        },
        error: (err) => {
          console.error('Erro ao atualizar fazenda:', err);
          alert('Erro ao atualizar fazenda.');
        }
      });
    } else {
      this.fazendaService.salvar(dados).subscribe({
        next: (fazendaCriada) => {
          if (this.isDialog) {
            this.dialogRef?.close(fazendaCriada);
          } else {
            this.voltar();
          }
        },
        error: (err) => {
          console.error('Erro ao salvar fazenda:', err);
          alert('Erro ao salvar fazenda.');
        }
      });
    }
  }

  voltar(): void {
    if (this.isDialog) {
      this.dialogRef?.close();
    } else {
      this.router.navigate(['../'], { relativeTo: this.route.parent });
    }
  }
}
