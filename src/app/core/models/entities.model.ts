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
  fazenda_id?: number;
}

export interface Fazenda {
  id?: number;
  inscricao: string;
  nome: string;
  uf: string;
  cidade: string;
  cnpj: string;
  titular_id?: number;
}

export interface Leilao {
  id?: number;
  local: string;
  uf: string;
  cidade: string;
  descricao: string;
  data: string;
  condicoes_id?: number;
  taxas_id?: number;
}

export interface Condicoes {
  id?: number;
  tipo: string;
  descricao: string;
}

export interface Taxas {
  id?: number;
  porcentagem: number;
  tipo_cliente: string;
}

export interface Lote {
  id?: number;
  codigo: string;
  qntd_animais: number;
  sexo: string;
  idade_em_meses: number;
  peso: number;
  raca: string;
  especie: string;
  categoria_animal: string;
  obs: string;
  leilao_id?: number;
  vendedor_id?: number;
  comprador_id?: number;
  preco_compra: number;
}

export interface Funcionario {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  senha?: string;
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
