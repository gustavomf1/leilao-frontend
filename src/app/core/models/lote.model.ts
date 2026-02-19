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
