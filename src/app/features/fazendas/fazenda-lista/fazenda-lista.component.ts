import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Fazenda } from '../../../core/models/fazenda.model';
import { FazendaService } from '../../../core/services/fazenda.service';

@Component({
  selector: 'app-fazenda-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fazenda-lista.component.html',
  styleUrl: './fazenda-lista.component.css'
})
export class FazendaListaComponent implements OnInit {
  private fazendaService = inject(FazendaService);

  fazendas: Fazenda[] = [];
  fazendasFiltradas: Fazenda[] = [];
  termoBusca = '';

  ngOnInit(): void {
    this.carregarFazendas();
  }

  carregarFazendas(): void {
    this.fazendaService.listar().subscribe({
      next: (dados) => {
        this.fazendas = dados;
        this.fazendasFiltradas = dados;
      },
      error: (err) => {
        console.error('Erro ao carregar fazendas:', err);
      }
    });
  }

  filtrar(event: Event): void {
    const termo = (event.target as HTMLInputElement).value.toLowerCase();
    this.termoBusca = termo;
    this.fazendasFiltradas = this.fazendas.filter(f =>
      f.nome.toLowerCase().includes(termo) ||
      f.cnpj.toLowerCase().includes(termo) ||
      f.cidade.toLowerCase().includes(termo)
    );
  }

  excluir(fazenda: Fazenda): void {
    if (confirm(`Deseja realmente excluir a fazenda "${fazenda.nome}"?`)) {
      this.fazendaService.excluir(fazenda.id!).subscribe({
        next: () => {
          this.carregarFazendas();
        },
        error: (err) => {
          console.error('Erro ao excluir fazenda:', err);
          alert('Erro ao excluir fazenda.');
        }
      });
    }
  }
}
