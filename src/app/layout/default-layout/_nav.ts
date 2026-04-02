import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  {
    title: true,
    name: 'Theme'
  },
  {
    name: 'Colors',
    url: '/theme/colors',
    iconComponent: { name: 'cil-drop' }
  },
  {
    name: 'Typography',
    url: '/theme/typography',
    linkProps: { fragment: 'headings' },
    iconComponent: { name: 'cil-pencil' }
  },
  {
    name: 'Components',
    title: true
  },
  {
    name: 'Base',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      { name: 'Accordion', url: '/base/accordion', icon: 'nav-icon-bullet' },
      { name: 'Breadcrumbs', url: '/base/breadcrumbs', icon: 'nav-icon-bullet' },
      { name: 'Cards', url: '/base/cards', icon: 'nav-icon-bullet' },
      { name: 'Carousel', url: '/base/carousel', icon: 'nav-icon-bullet' },
      { name: 'Collapse', url: '/base/collapse', icon: 'nav-icon-bullet' },
      { name: 'List Group', url: '/base/list-group', icon: 'nav-icon-bullet' },
      { name: 'Navs & Tabs', url: '/base/navs', icon: 'nav-icon-bullet' },
      { name: 'Pagination', url: '/base/pagination', icon: 'nav-icon-bullet' },
      { name: 'Placeholder', url: '/base/placeholder', icon: 'nav-icon-bullet' },
      { name: 'Popovers', url: '/base/popovers', icon: 'nav-icon-bullet' },
      { name: 'Progress', url: '/base/progress', icon: 'nav-icon-bullet' },
      { name: 'Spinners', url: '/base/spinners', icon: 'nav-icon-bullet' },
      { name: 'Tables', url: '/base/tables', icon: 'nav-icon-bullet' },
      { name: 'Tabs', url: '/base/tabs', icon: 'nav-icon-bullet' },
      { name: 'Tooltips', url: '/base/tooltips', icon: 'nav-icon-bullet' }
    ]
  },
  {
    name: 'Buttons',
    url: '/buttons',
    iconComponent: { name: 'cil-cursor' },
    children: [
      { name: 'Buttons', url: '/buttons/buttons', icon: 'nav-icon-bullet' },
      { name: 'Button groups', url: '/buttons/button-groups', icon: 'nav-icon-bullet' },
      { name: 'Dropdowns', url: '/buttons/dropdowns', icon: 'nav-icon-bullet' }
    ]
  },
  {
    name: 'Forms',
    url: '/forms',
    iconComponent: { name: 'cil-notes' },
    children: [
      { name: 'Form Control', url: '/forms/form-control', icon: 'nav-icon-bullet' },
      { name: 'Checks & Radios', url: '/forms/checks-radios', icon: 'nav-icon-bullet' },
      { name: 'Floating Labels', url: '/forms/floating-labels', icon: 'nav-icon-bullet' },
      { name: 'Input Group', url: '/forms/input-group', icon: 'nav-icon-bullet' },
      { name: 'Range', url: '/forms/range', icon: 'nav-icon-bullet' },
      { name: 'Select', url: '/forms/select', icon: 'nav-icon-bullet' },
      { name: 'Layout', url: '/forms/layout', icon: 'nav-icon-bullet' },
      { name: 'Validation', url: '/forms/validation', icon: 'nav-icon-bullet' }
    ]
  },
  { name: 'Charts', iconComponent: { name: 'cil-chart-pie' }, url: '/charts' },
  {
    name: 'Icons',
    iconComponent: { name: 'cil-star' },
    url: '/icons',
    children: [
      { name: 'CoreUI Free', url: '/icons/coreui-icons', icon: 'nav-icon-bullet', badge: { color: 'success', text: 'FREE' } },
      { name: 'CoreUI Flags', url: '/icons/flags', icon: 'nav-icon-bullet' },
      { name: 'CoreUI Brands', url: '/icons/brands', icon: 'nav-icon-bullet' }
    ]
  },
  {
    name: 'Notifications',
    url: '/notifications',
    iconComponent: { name: 'cil-bell' },
    children: [
      { name: 'Alerts', url: '/notifications/alerts', icon: 'nav-icon-bullet' },
      { name: 'Badges', url: '/notifications/badges', icon: 'nav-icon-bullet' },
      { name: 'Modal', url: '/notifications/modal', icon: 'nav-icon-bullet' },
      { name: 'Toast', url: '/notifications/toasts', icon: 'nav-icon-bullet' }
    ]
  },
  {
    name: 'Widgets',
    url: '/widgets',
    iconComponent: { name: 'cil-calculator' },
    badge: { color: 'info', text: 'NEW' }
  },
  { title: true, name: 'Extras' },
  {
    name: 'Pages',
    url: '/login',
    iconComponent: { name: 'cil-star' },
    children: [
      { name: 'Login', url: '/login', icon: 'nav-icon-bullet' },
      { name: 'Register', url: '/register', icon: 'nav-icon-bullet' },
      { name: 'Error 404', url: '/404', icon: 'nav-icon-bullet' },
      { name: 'Error 500', url: '/500', icon: 'nav-icon-bullet' }
    ]
  },
  { title: true, name: 'Links', class: 'mt-auto' },
  {
    name: 'Docs',
    url: 'https://coreui.io/angular/docs/',
    iconComponent: { name: 'cil-description' },
    attributes: { target: '_blank' }
  }
];

// Cada item de nav pode ter attributes.ambiente e attributes.acao para filtrar por permissão
// 'lista' requer VISUALIZAR, 'cadastrar' requer CRIAR
export const navItemsLeilao: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    attributes: { ambiente: 'DASHBOARD' }
  },

  // ─── Funcionários ─────────────────────────────────────────────
  {
    title: true,
    name: 'Funcionários',
    attributes: { ambiente: 'FUNCIONARIOS' }
  },
  {
    name: 'Funcionários',
    url: '/funcionarios',
    iconComponent: { name: 'cil-contact' },
    attributes: { ambiente: 'FUNCIONARIOS' },
    children: [
      {
        name: 'Listar Funcionários',
        url: '/funcionarios/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'FUNCIONARIOS', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Funcionário',
        url: '/funcionarios/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'FUNCIONARIOS', acao: 'CRIAR' }
      }
    ]
  },

  // ─── Núcleo de Negócio ────────────────────────────────────────
  {
    title: true,
    name: 'Núcleo de Negócio',
    attributes: { ambientes: 'CLIENTES,FAZENDAS' }
  },
  {
    name: 'Clientes',
    url: '/clientes',
    iconComponent: { name: 'cil-user' },
    attributes: { ambiente: 'CLIENTES' },
    children: [
      {
        name: 'Listar Clientes',
        url: '/clientes/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'CLIENTES', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Cliente',
        url: '/clientes/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'CLIENTES', acao: 'CRIAR' }
      }
    ]
  },
  {
    name: 'Fazendas',
    url: '/fazendas',
    iconComponent: { name: 'cil-home' },
    attributes: { ambiente: 'FAZENDAS' },
    children: [
      {
        name: 'Listar Fazendas',
        url: '/fazendas/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'FAZENDAS', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Fazenda',
        url: '/fazendas/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'FAZENDAS', acao: 'CRIAR' }
      }
    ]
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
    attributes: { ambiente: 'LEILOES' },
    children: [
      {
        name: 'Listar Leilões',
        url: '/leiloes/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'LEILOES', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Leilão',
        url: '/leiloes/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'LEILOES', acao: 'CRIAR' }
      }
    ]
  },
  {
    name: 'Condições',
    url: '/condicoes',
    iconComponent: { name: 'cil-description' },
    attributes: { ambiente: 'CONDICOES' },
    children: [
      {
        name: 'Listar Condições',
        url: '/condicoes/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'CONDICOES', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Condição',
        url: '/condicoes/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'CONDICOES', acao: 'CRIAR' }
      }
    ]
  },
  {
    name: 'Taxas',
    url: '/taxas',
    iconComponent: { name: 'cil-dollar' },
    attributes: { ambiente: 'TAXAS' },
    children: [
      {
        name: 'Listar Taxas',
        url: '/taxas/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'TAXAS', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Taxa',
        url: '/taxas/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'TAXAS', acao: 'CRIAR' }
      }
    ]
  },

  {
    name: 'Espécies',
    url: '/especies',
    iconComponent: { name: 'cil-animal' },
    attributes: { ambiente: 'ESPECIES' },
    children: [
      {
        name: 'Listar Espécies',
        url: '/especies/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'ESPECIES', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Espécie',
        url: '/especies/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'ESPECIES', acao: 'CRIAR' }
      }
    ]
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
    attributes: { ambiente: 'LOTES' },
    children: [
      {
        name: 'Listar Lotes',
        url: '/lotes/lista',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'LOTES', acao: 'VISUALIZAR' }
      },
      {
        name: 'Cadastrar Lote',
        url: '/lotes/cadastrar',
        icon: 'nav-icon-bullet',
        attributes: { ambiente: 'LOTES', acao: 'CRIAR' }
      }
    ]
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
