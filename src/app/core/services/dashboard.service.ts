import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardVendasSexoItem {
  sexo: string;
  lotesVendidos: number;
  animaisVendidos: number;
  totalVendido: number;
  precoMedioPorAnimal: number;
  precoMedioPorLote: number;
  percentualValor: number;
}

export interface DashboardVendasRacaItem {
  raca: string;
  lotesVendidos: number;
  animaisVendidos: number;
  totalVendido: number;
  precoMedioPorAnimal: number;
  precoMedioPorLote: number;
  percentualValor: number;
}

export interface DashboardVendasSexo {
  totalVendido: number;
  totalLotes: number;
  totalAnimais: number;
  itens: DashboardVendasSexoItem[];
}

export interface DashboardVendasRaca {
  totalVendido: number;
  totalLotes: number;
  totalAnimais: number;
  itens: DashboardVendasRacaItem[];
}

export interface DashboardLeilaoRecente {
  id: number;
  descricao: string;
  local: string;
  cidade?: string;
  uf?: string;
  data: string;
  especie: string;
  tipo: string;
  lotes: number;
  animaisVendidos: number;
  totalVendido: number;
}

export interface DashboardLeilaoVenda {
  id: number;
  descricao: string;
  data: string;
  lotesVendidos: number;
  animaisVendidos: number;
  totalVendido: number;
  precoMedioPorAnimal: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  buscarVendasPorSexo(leilaoId?: number): Observable<DashboardVendasSexo> {
    const options = leilaoId ? { params: { leilaoId } } : undefined;
    return this.http.get<DashboardVendasSexo>(`${this.baseUrl}/api/dashboard/vendas-sexo`, options);
  }

  buscarVendasPorRaca(leilaoId?: number): Observable<DashboardVendasRaca> {
    const options = leilaoId ? { params: { leilaoId } } : undefined;
    return this.http.get<DashboardVendasRaca>(`${this.baseUrl}/api/dashboard/vendas-raca`, options);
  }

  buscarLeiloesRecentes(dias = 30): Observable<DashboardLeilaoRecente[]> {
    return this.http.get<DashboardLeilaoRecente[]>(`${this.baseUrl}/api/dashboard/leiloes-recentes`, {
      params: { dias },
    });
  }

  buscarVendasUltimosLeiloes(limite = 30): Observable<DashboardLeilaoVenda[]> {
    return this.http.get<DashboardLeilaoVenda[]>(`${this.baseUrl}/api/dashboard/vendas-ultimos-leiloes`, {
      params: { limite },
    });
  }
}
