import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ClienteFormComponent } from './features/clientes/cliente-form/cliente-form.component';
import { ClienteListaComponent } from './features/clientes/cliente-lista/cliente-lista.component';
import { CondicaoFormComponent } from './features/condicoes/condicao-form/condicao-form.component';
import { CondicaoListaComponent } from './features/condicoes/condicao-lista/condicao-lista.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FazendaFormComponent } from './features/fazendas/fazenda-form/fazenda-form.component';
import { FazendaListaComponent } from './features/fazendas/fazenda-lista/fazenda-lista.component';
import { LayoutComponent } from './features/layout/layout.component';
import { LeilaoFormComponent } from './features/leiloes/leilao-form/leilao-form.component';
import { LeilaoListaComponent } from './features/leiloes/leilao-lista/leilao-lista.component';
import { TaxaFormComponent } from './features/taxas/taxa-form/taxa-form.component';
import { TaxaListaComponent } from './features/taxas/taxa-lista/taxa-lista.component';
import { MonitorLotesComponent } from './features/lotes/monitor-lotes/monitor-lotes.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clientes', component: ClienteListaComponent },
      { path: 'clientes/form', component: ClienteFormComponent },
      { path: 'clientes/form/:id', component: ClienteFormComponent },
      { path: 'fazendas', component: FazendaListaComponent },
      { path: 'fazendas/form', component: FazendaFormComponent },
      { path: 'fazendas/form/:id', component: FazendaFormComponent },
      { path: 'leiloes', component: LeilaoListaComponent },
      { path: 'leiloes/form', component: LeilaoFormComponent },
      { path: 'leiloes/form/:id', component: LeilaoFormComponent },
      { path: 'condicoes', component: CondicaoListaComponent },
      { path: 'condicoes/form', component: CondicaoFormComponent },
      { path: 'condicoes/form/:id', component: CondicaoFormComponent },
      { path: 'taxas', component: TaxaListaComponent },
      { path: 'taxas/form', component: TaxaFormComponent },
      { path: 'taxas/form/:id', component: TaxaFormComponent },
      { path: 'lotes/monitor', component: MonitorLotesComponent},
      //{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '', redirectTo: 'lotes/monitor', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
