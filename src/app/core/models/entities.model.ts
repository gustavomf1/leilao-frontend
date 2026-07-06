export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  cpfCnpj: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  pessoa: 'F' | 'J';
  cpfCnpj: string;
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
  cpfCnpj: string;
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
  condicoesId?: number;
  condicoes_id?: number;
  taxaPadraoId?: number;
  especieId?: number;
  especieNome?: string;
  leiloeiroId?: number;
  leiloeiroNome?: string;
  tipoLeilao?: TipoLeilao;
  taxaPor?: TaxaPor;
  status?: StatusLeilao;
}

export type StatusLeilao = 'ABERTO' | 'EM_ANDAMENTO' | 'FINALIZADO';

export const STATUS_LEILAO_LABELS: Record<StatusLeilao, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO: 'Finalizado',
};

export const STATUS_LEILAO_COLOR: Record<StatusLeilao, string> = {
  ABERTO: 'info',
  EM_ANDAMENTO: 'success',
  FINALIZADO: 'dark',
};

export interface LeilaoDetalhes {
  id: number;
  local: string;
  uf: string;
  cidade: string;
  descricao: string;
  data: string;
  inativo: string;
  status: StatusLeilao;
  condicao?: Condicoes;
  condicoesId?: number;
  taxaPadraoId?: number;
  taxaPadrao?: Taxas;
  especie?: Especie;
  especieId?: number;
  especieNome?: string;
  leiloeiro?: Funcionario;
  leiloeiroId?: number;
  leiloeiroNome?: string;
  tipoLeilao?: TipoLeilao;
  taxaPor?: TaxaPor;
  taxa?: number;
  comissaoVenda?: number;
  comissaoCompra?: number;
  gta?: number;
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

export type TipoLeilao =
  | 'PRESENCIAL'
  | 'ONLINE'
  | 'HIBRIDO'
  | 'ELITE'
  | 'CORTE'
  | 'LEITE'
  | 'PRENHEZ'
  | 'OUTROS'
  | 'DOACAO';

export type TaxaPor = 'ANIMAL' | 'LOTE';

export const TIPO_LEILAO_LABELS: Record<TipoLeilao, string> = {
  PRESENCIAL: 'Presencial',
  ONLINE: 'Online',
  HIBRIDO: 'Híbrido',
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

export interface Raca {
  id?: number;
  nome: string;
  especieId: number;
  especieNome?: string;
  inativo?: string;
}

export interface Taxas {
  id?: number;
  taxa: number;
  comissaoVenda: number;
  comissaoCompra: number;
  gta: number;
  atualizadoEm?: string;
}

export type StatusLote =
  | 'AGUARDANDO_ESCRITORIO'
  | 'AGUARDANDO_LANCE'
  | 'AGUARDANDO_ULTIMA_VALIDACAO'
  | 'FINALIZADO';

export const STATUS_LOTE_LABELS: Record<StatusLote, string> = {
  AGUARDANDO_ESCRITORIO:       'Aguardando Escritório',
  AGUARDANDO_LANCE:            'Aguardando Lance',
  AGUARDANDO_ULTIMA_VALIDACAO: 'Aguardando Ult. Validação',
  FINALIZADO:                  'Finalizado',
};

export const STATUS_LOTE_COLOR: Record<StatusLote, string> = {
  AGUARDANDO_ESCRITORIO:       'warning',
  AGUARDANDO_LANCE:            'info',
  AGUARDANDO_ULTIMA_VALIDACAO: 'primary',
  FINALIZADO:                  'dark',
};

export interface Lote {
  id?: number;
  codigo: string;
  qntdAnimais: number;
  sexo: string;
  idadeEmMeses: number;
  peso: number;
  raca: string;
  especie: string;
  especieId?: number;
  categoriaAnimal: string;
  obs: string;
  leilaoId?: number;
  vendedorId?: number;
  compradorId?: number;
  precoCompra?: number;
  vendedorNome?: string;
  vendedorNomeRascunho?: string;
  compradorNomeRascunho?: string;
  compradorNome?: string;
  comissaoVenda?: number;
  comissaoCompra?: number;
  vendedorPixId?: number;
  vendedorPixTipo?: 'CPF_CNPJ' | 'TELEFONE' | 'EMAIL' | 'CHAVE_ALEATORIA';
  vendedorPixChave?: string;
  status?: StatusLote;
  naoVendidoNoLeilao?: string;
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
  cpfCnpj: string;
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

export interface FaturaEnvioLog {
  loteId: number;
  tipoFatura: 'COMPRA' | 'VENDA';
  status: 'ENVIANDO' | 'ENVIADO' | 'ENTREGUE' | 'FALHA';
  enviadoEm?: string;
  evolutionMessageId?: string;
}

