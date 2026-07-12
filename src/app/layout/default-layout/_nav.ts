import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  }
];

// Nav exclusivo para funcionários de manejo — acesso restrito a lotes
export const navItemsManejo: INavData[] = [
  {
    title: true,
    name: 'Movimentação'
  },
  {
    name: 'Lotes',
    url: '/lotes',
    iconComponent: { name: 'cil-tags' }
  },
  { title: true, name: 'Sistema', class: 'mt-auto' },
  { name: 'Configurações', url: '/configuracoes', iconComponent: { name: 'cil-settings' } }
];

// Nav principal — flat (sem dropdowns).
// Cada item leva direto pra /<entidade>/lista (rota redireciona automaticamente).
// `attributes.ambiente` + `acao: 'VISUALIZAR'` filtra item por permissão.
export const navItemsLeilao: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    attributes: { ambiente: 'DASHBOARD' }
  },

  // ─── Núcleo de Negócio ────────────────────────────────────────
  {
    title: true,
    name: 'Núcleo de Negócio',
    attributes: { ambientes: 'CLIENTES,FAZENDAS,FUNCIONARIOS' }
  },
  {
    name: 'Clientes',
    url: '/clientes',
    iconComponent: { name: 'cil-user' },
    attributes: { ambiente: 'CLIENTES', acao: 'VISUALIZAR' }
  },
  {
    name: 'Fazendas',
    url: '/fazendas',
    iconComponent: { name: 'cil-home' },
    attributes: { ambiente: 'FAZENDAS', acao: 'VISUALIZAR' }
  },
  {
    name: 'Funcionários',
    url: '/funcionarios',
    iconComponent: { name: 'cil-contact' },
    attributes: { ambiente: 'FUNCIONARIOS', acao: 'VISUALIZAR' }
  },

  // ─── Configuração do Evento ───────────────────────────────────
  {
    title: true,
    name: 'Configuração do Evento',
    attributes: { ambientes: 'LEILOES,CONDICOES,TAXAS,ESPECIES' }
  },
  {
    name: 'Leilões',
    url: '/leiloes',
    iconComponent: { name: 'cil-calendar' },
    attributes: { ambiente: 'LEILOES', acao: 'VISUALIZAR' }
  },
  {
    name: 'Condições',
    url: '/condicoes',
    iconComponent: { name: 'cil-description' },
    attributes: { ambiente: 'CONDICOES', acao: 'VISUALIZAR' }
  },
  {
    name: 'Taxa Padrão',
    url: '/taxas',
    iconComponent: { name: 'cil-dollar' },
    attributes: { ambiente: 'TAXAS', acao: 'VISUALIZAR' }
  },
  {
    name: 'Espécies',
    url: '/especies',
    iconComponent: { name: 'cil-animal' },
    attributes: { ambiente: 'ESPECIES', acao: 'VISUALIZAR' }
  },
  {
    name: 'Raças',
    url: '/racas',
    iconComponent: { name: 'cil-animal' },
    attributes: { ambiente: 'ESPECIES', acao: 'VISUALIZAR' }
  },

  // ─── Movimentação ─────────────────────────────────────────────
  {
    title: true,
    name: 'Movimentação',
    attributes: { ambientes: 'LOTES' }
  },
  {
    name: 'Lotes',
    url: '/lotes',
    iconComponent: { name: 'cil-tags' },
    attributes: { ambiente: 'LOTES', acao: 'VISUALIZAR' }
  },

  // ─── Relatórios ───────────────────────────────────────────────
  {
    title: true,
    name: 'Relatórios'
  },
  {
    name: 'Relatórios',
    url: '/relatorios',
    iconComponent: { name: 'cil-description' },
    children: [
      {
        name: 'Fatura de Venda',
        url: '/relatorios/fatura-venda',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Fatura de Compra',
        url: '/relatorios/fatura-compra',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Liberação',
        url: '/relatorios/liberacao',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Mapa do Leilao',
        url: '/relatorios/mapa-leilao',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Fechamento do Leilao',
        url: '/relatorios/fechamento-leilao',
        icon: 'nav-icon-bullet',
      },
    ],
  },

  // ─── Catálogos ────────────────────────────────────────────────
  {
    title: true,
    name: 'Catálogos'
  },
  {
    name: 'Catálogo',
    url: '/catalogos/catalogo',
    iconComponent: { name: 'cil-description' }
  },

  // ─── Comunicação ──────────────────────────────────────────────
  {
    title: true,
    name: 'Comunicação',
    attributes: { ambientes: 'WHATSAPP' }
  },
  {
    name: 'WhatsApp',
    url: '/whatsapp',
    iconComponent: { name: 'cil-speech' },
    attributes: { ambiente: 'WHATSAPP', acao: 'CRIAR' }
  },

  // ─── Administração ────────────────────────────────────────────
  {
    title: true,
    name: 'Administração',
    attributes: { adminOnly: 'true' }
  },
  {
    name: 'Permissões',
    url: '/admin/roles',
    iconComponent: { name: 'cil-shield-alt' },
    attributes: { adminOnly: 'true' }
  },

  // ─── Sistema ──────────────────────────────────────────────────
  {
    title: true,
    name: 'Sistema',
    class: 'mt-auto'
  },
  {
    name: 'Configurações',
    url: '/configuracoes',
    iconComponent: { name: 'cil-settings' }
  }
];
