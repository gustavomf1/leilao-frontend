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