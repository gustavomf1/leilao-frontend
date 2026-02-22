import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout').then((m) => m.DefaultLayoutComponent),
    data: {
      title: 'Home',
    },
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/routes').then((m) => m.routes),
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes),
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/routes').then((m) => m.routes),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/routes').then((m) => m.routes),
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/routes').then((m) => m.routes),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/routes').then((m) => m.routes),
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/routes').then((m) => m.routes),
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./views/charts/routes').then((m) => m.routes),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/routes').then((m) => m.routes),
      },
      //Aqui começa os nossos componentes
      {
        path: 'usuarios',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/usuario/usuario-list/usuario-list.component').then(
                (m) => m.UsuariosListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/usuario/usuario-details/usuario-details.component').then(
                (m) => m.UsuariosDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/usuario/usuario-details/usuario-details.component').then(
                (m) => m.UsuariosDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'clientes',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/cliente/cliente-list/cliente-list.component').then(
                (m) => m.ClientesListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/cliente/cliente-details/cliente-details.component').then(
                (m) => m.ClientesDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/cliente/cliente-details/cliente-details.component').then(
                (m) => m.ClientesDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'fazendas',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/fazenda/fazenda-list/fazenda-list.component').then(
                (m) => m.FazendasListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/fazenda/fazenda-details/fazenda-details.component').then(
                (m) => m.FazendasDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/fazenda/fazenda-details/fazenda-details.component').then(
                (m) => m.FazendasDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'leiloes',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/leilao/leilao-list/leilao-list.component').then(
                (m) => m.LeiloesListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/leilao/leilao-details/leilao-details.component').then(
                (m) => m.LeiloesDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/leilao/leilao-details/leilao-details.component').then(
                (m) => m.LeiloesDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'condicoes',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/condicoes/condicoes-list/condicoes-list.component').then(
                (m) => m.CondicoesListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/condicoes/condicoes-details/condicoes-details.component').then(
                (m) => m.CondicoesDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/condicoes/condicoes-details/condicoes-details.component').then(
                (m) => m.CondicoesDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'taxas',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/taxas/taxas-list/taxas-list.component').then(
                (m) => m.TaxasListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/taxas/taxas-details/taxas-details.component').then(
                (m) => m.TaxasDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/taxas/taxas-details/taxas-details.component').then(
                (m) => m.TaxasDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'lotes',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/lote/lote-list/lote-list.component').then(
                (m) => m.LotesListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/lote/lote-details/lote-details.component').then(
                (m) => m.LotesDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/lote/lote-details/lote-details.component').then(
                (m) => m.LotesDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'funcionarios',
        children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          {
            path: 'lista',
            loadComponent: () =>
              import('./components/funcionario/funcionario-list/funcionario-list.component').then(
                (m) => m.FuncionariosListComponent,
              ),
          },
          {
            path: 'cadastrar',
            loadComponent: () =>
              import('./components/funcionario/funcionario-details/funcionario-details.component').then(
                (m) => m.FuncionariosDetailsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/funcionario/funcionario-details/funcionario-details.component').then(
                (m) => m.FuncionariosDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'whatsapp',
        loadComponent: () =>
          import('./components/whatsapp/whatsapp.component').then(
            (m) => m.WhatsAppComponent,
          ),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component,
      ),
    data: {
      title: 'Page 404',
    },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component,
      ),
    data: {
      title: 'Page 500',
    },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    data: {
      title: 'Login Page',
    },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./views/pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    data: {
      title: 'Register Page',
    },
  },
  // { path: '**', redirectTo: '404' },
];
