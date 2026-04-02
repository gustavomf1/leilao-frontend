import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cliente-lista.component.html',
  styleUrl: './cliente-lista.component.css'
})
export class ClienteListaComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private alert = inject(AlertService);

  clientes: Cliente[] = [];
  filtro: string = '';

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (dados) => this.clientes = dados,
      error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao carregar clientes')
    });
  }

  get clientesFiltrados(): Cliente[] {
    if (!this.filtro.trim()) {
      return this.clientes;
    }
    const termo = this.filtro.toLowerCase().trim();
    return this.clientes.filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      c.cpf.toLowerCase().includes(termo) ||
      c.cidade.toLowerCase().includes(termo)
    );
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clienteService.excluir(id).subscribe({
        next: () => this.carregarClientes(),
        error: (err) => this.alert.error(err.error?.mensagem || 'Erro ao excluir cliente')
      });
    }
  }
}
