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
  titularNome?: string;
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

export interface LeilaoDetalhes {
  id: number;
  local: string;
  uf: string;
  cidade: string;
  descricao: string;
  data: string;
  inativo: string;
  condicao: Condicoes;
  taxa: {
    id: number;
    comissaoVendedor: number;
    comissaoComprador: number;
    especie: Especie;
    tipoLeilao: string;
    taxaPor: string;
    inativo: string;
  };
}

export interface Condicoes {
  id?: number;
  descricao: string;
  captacao?: number;
  parcelas?: number;
  qtdDias?: number;
  percentualDesconto?: number;
  comEntrada?: string;
  mesmoDia?: string;
  tipoCondicao?: string;
  aceiteIntegrado?: string;
}

export type TipoLeilao = 'ELITE' | 'CORTE' | 'LEITE' | 'PRENHEZ' | 'OUTROS' | 'DOACAO';

export type TaxaPor = 'ANIMAL' | 'LOTE';

export const TIPO_LEILAO_LABELS: Record<TipoLeilao, string> = {
  ELITE:   'Elite',
  CORTE:   'Corte',
  LEITE:   'Leite',
  PRENHEZ: 'Prenhez',
  OUTROS:  'Outros',
  DOACAO:  'Doação',
};

export interface Especie {
  id?: number;
  nome: string;
  inativo?: string;
}

export interface Taxas {
  id?: number;
  comissaoVendedor: number;
  comissaoComprador: number;
  especieId: number;
  especieNome?: string;
  tipoLeilao: TipoLeilao;
  taxaPor: TaxaPor;
  inativo?: string;
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
  vendedorNome?: string;
}

export interface Permissao {
  acao: string;
  ambiente: string;
}

export interface Role {
  id?: number;
  nome: string;
  descricao?: string;
  permissoes?: Permissao[];
}

export const ACOES = ['CRIAR', 'EDITAR', 'DELETAR', 'VISUALIZAR'] as const;

export const AMBIENTES = [
  'DASHBOARD', 'FUNCIONARIOS', 'CLIENTES', 'FAZENDAS',
  'LEILOES', 'CONDICOES', 'TAXAS', 'ESPECIES', 'LOTES', 'WHATSAPP'
] as const;

export const AMBIENTE_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  FUNCIONARIOS: 'Funcionários',
  CLIENTES: 'Clientes',
  FAZENDAS: 'Fazendas',
  LEILOES: 'Leilões',
  CONDICOES: 'Condições',
  TAXAS: 'Taxas',
  ESPECIES: 'Espécies',
  LOTES: 'Lotes',
  WHATSAPP: 'WhatsApp'
};

export const ACAO_LABELS: Record<string, string> = {
  CRIAR: 'Criar',
  EDITAR: 'Editar',
  DELETAR: 'Deletar',
  VISUALIZAR: 'Visualizar'
};

export interface Funcionario {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  senha?: string;
  isAdmin?: boolean;
  roles?: Role[];
}

export interface Pix {
  pixId?: number;
  tipo: 'CPF_CNPJ' | 'TELEFONE' | 'EMAIL' | 'CHAVE_ALEATORIA';
  chave: string;
  usuarioId?: number;
  usuarioNome?: string;
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
