export interface Cliente {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cidade: string;
  uf: string;
  rg: string;
  fazenda_id?: number;
}
