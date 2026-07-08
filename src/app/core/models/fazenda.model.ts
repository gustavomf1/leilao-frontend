export interface Fazenda {
  id?: number;
  inscricao: string;
  nome: string;
  uf: string;
  cidade: string;
  cpfCnpj: string;
  titularId?: number;
  titularNome?: string;
}
