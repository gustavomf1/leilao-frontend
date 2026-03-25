export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  cpf: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  cpf: string;
  telefone: string;
  cidade: string;
  uf: string;
  rg: string;
  fazendaId?: number;
}

export interface Fazenda {
  id?: number;
  inscricao: string;
  nome: string;
  uf: string;
  cidade: string;
  cnpj: string;
  titularId?: number;
}

export interface Leilao {
  id?: number;
  local: string;
  uf: string;
  cidade: string;
  descricao: string;
  data: string;
  condicoesId?: number;
  taxasId?: number;
}

export interface Condicoes {
  id?: number;
  tipo: string;
  descricao: string;
}

export interface Taxas {
  id?: number;
  porcentagem: number;
  tipoCliente: string;
}

export interface Lote {
  id?: number;
  codigo: string;
  qntdAnimais: number;
  sexo: string;
  idadeEmMeses: number;
  peso: number;
  raca: string;
  especie: string;
  categoriaAnimal: string;
  obs: string;
  leilaoId?: number;
  vendedorId?: number;
  compradorId?: number;
  precoCompra: number;
}

export interface Role {
  id?: number;
  nome: string;
  descricao?: string;
}

export interface Funcionario {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  senha?: string;
  isAdmin?: boolean;
  roles?: Role[];
}

export interface AtribuirRoles {
  roleIds: number[];
  isAdmin: boolean;
}

// ─── WhatsApp (Evolution API) ───────────────────────────────────

export interface WhatsAppTextMessage {
  number: string;
  text: string;
  delay?: number;
}

export interface WhatsAppMediaMessage {
  number: string;
  mediatype: string;
  mimeType: string;
  fileName: string;
  url: string;
  caption?: string;
}

export interface WhatsAppBulkContact {
  number: string;
  nome: string;
}

export interface WhatsAppBulkTextMessage {
  contatos: WhatsAppBulkContact[];
  text: string;
  delayMinMs?: number;
  delayMaxMs?: number;
}

export interface WhatsAppBulkMediaMessage {
  contatos: WhatsAppBulkContact[];
  url: string;
  caption?: string;
  mediatype: string;
  mimeType: string;
  delayMinMs?: number;
  delayMaxMs?: number;
}
