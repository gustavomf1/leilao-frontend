export interface Leilao {
  id?: number;
  local: string;
  uf: string;
  cidade: string;
  descricao: string;
  data: string;
  condicoesId?: number;
  taxaPadraoId?: number;
  especieId?: number;
  tipoLeilao?: 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO' | 'ELITE' | 'CORTE' | 'LEITE' | 'PRENHEZ' | 'OUTROS' | 'DOACAO';
  taxaPor?: 'ANIMAL' | 'LOTE';
}
