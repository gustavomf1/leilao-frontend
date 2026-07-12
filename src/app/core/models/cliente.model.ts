export interface Cliente {
  id?: number;
  nome: string;
  email: string;
  pessoa: 'F' | 'J';
  cpfCnpj: string;
  ddi: string;
  telefone: string;
  cidade: string;
  uf: string;
  rg: string;
  fazendaId?: number;
}
