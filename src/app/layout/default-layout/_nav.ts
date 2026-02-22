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
      {
        name: 'Accordion',
        url: '/base/accordion',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Breadcrumbs',
        url: '/base/breadcrumbs',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Calendar',
        url: 'https://coreui.io/angular/docs/components/calendar/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Cards',
        url: '/base/cards',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Carousel',
        url: '/base/carousel',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Collapse',
        url: '/base/collapse',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'List Group',
        url: '/base/list-group',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Navs & Tabs',
        url: '/base/navs',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Pagination',
        url: '/base/pagination',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Placeholder',
        url: '/base/placeholder',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Smart Table',
        url: 'https://coreui.io/angular/docs/components/smart-table/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Smart Pagination',
        url: 'https://coreui.io/angular/docs/components/smart-pagination/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Popovers',
        url: '/base/popovers',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Progress',
        url: '/base/progress',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Spinners',
        url: '/base/spinners',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Tables',
        url: '/base/tables',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Tabs',
        url: '/base/tabs',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Tooltips',
        url: '/base/tooltips',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Buttons',
    url: '/buttons',
    iconComponent: { name: 'cil-cursor' },
    children: [
      {
        name: 'Buttons',
        url: '/buttons/buttons',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Button groups',
        url: '/buttons/button-groups',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Dropdowns',
        url: '/buttons/dropdowns',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Loading Button',
        url: 'https://coreui.io/angular/docs/components/loading-button/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      }
    ]
  },
  {
    name: 'Forms',
    url: '/forms',
    iconComponent: { name: 'cil-notes' },
    children: [
      {
        name: 'Autocomplete',
        url: 'https://coreui.io/angular/docs/forms/autocomplete/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Form Control',
        url: '/forms/form-control',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Checks & Radios',
        url: '/forms/checks-radios',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Date Picker',
        url: 'https://coreui.io/angular/docs/forms/date-picker/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Date Range Picker',
        url: 'https://coreui.io/angular/docs/forms/date-range-picker/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Floating Labels',
        url: '/forms/floating-labels',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Input Group',
        url: '/forms/input-group',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Multi Select',
        url: 'https://coreui.io/angular/docs/forms/multi-select/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'OTP Input',
        url: 'https://coreui.io/angular/docs/forms/otp/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Password Input',
        url: 'https://coreui.io/angular/docs/forms/password-input/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Range',
        url: '/forms/range',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Range Slider',
        url: 'https://coreui.io/angular/docs/forms/range-slider/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Rating',
        url: 'https://coreui.io/angular/docs/forms/rating/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Select',
        url: '/forms/select',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Stepper',
        url: 'https://coreui.io/angular/docs/forms/stepper/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Time Picker',
        url: 'https://coreui.io/angular/docs/forms/time-picker/',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'danger',
          text: 'PRO'
        },
        attributes: { target: '_blank' }
      },
      {
        name: 'Layout',
        url: '/forms/layout',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Validation',
        url: '/forms/validation',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Charts',
    iconComponent: { name: 'cil-chart-pie' },
    url: '/charts'
  },
  {
    name: 'Icons',
    iconComponent: { name: 'cil-star' },
    url: '/icons',
    children: [
      {
        name: 'CoreUI Free',
        url: '/icons/coreui-icons',
        icon: 'nav-icon-bullet',
        badge: {
          color: 'success',
          text: 'FREE'
        }
      },
      {
        name: 'CoreUI Flags',
        url: '/icons/flags',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'CoreUI Brands',
        url: '/icons/brands',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Notifications',
    url: '/notifications',
    iconComponent: { name: 'cil-bell' },
    children: [
      {
        name: 'Alerts',
        url: '/notifications/alerts',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Badges',
        url: '/notifications/badges',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Modal',
        url: '/notifications/modal',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Toast',
        url: '/notifications/toasts',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Widgets',
    url: '/widgets',
    iconComponent: { name: 'cil-calculator' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  {
    title: true,
    name: 'Extras'
  },
  {
    name: 'Pages',
    url: '/login',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Login',
        url: '/login',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Register',
        url: '/register',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Error 404',
        url: '/404',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Error 500',
        url: '/500',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    title: true,
    name: 'Links',
    class: 'mt-auto'
  },
  {
    name: 'Docs',
    url: 'https://coreui.io/angular/docs/',
    iconComponent: { name: 'cil-description' },
    attributes: { target: '_blank' }
  }
];
//Para testes
export const navItemsLeilao: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },

  // ─── Usuários e Acessos ───────────────────────────────────────
  {
    title: true,
    name: 'Usuários e Acessos'
  },
  {
    name: 'Usuários',
    url: '/usuarios',
    iconComponent: { name: 'cil-people' },
    children: [
      {
        name: 'Listar Usuários',
        url: '/usuarios/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Usuário',
        url: '/usuarios/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },

  // ─── Núcleo de Negócio ────────────────────────────────────────
  {
    title: true,
    name: 'Núcleo de Negócio'
  },
  {
    name: 'Clientes',
    url: '/clientes',
    iconComponent: { name: 'cil-user' },
    children: [
      {
        name: 'Listar Clientes',
        url: '/clientes/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Cliente',
        url: '/clientes/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Fazendas',
    url: '/fazendas',
    iconComponent: { name: 'cil-home' },
    children: [
      {
        name: 'Listar Fazendas',
        url: '/fazendas/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Fazenda',
        url: '/fazendas/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },

  // ─── Configuração do Evento ───────────────────────────────────
  {
    title: true,
    name: 'Configuração do Evento'
  },
  {
    name: 'Leilões',
    url: '/leiloes',
    iconComponent: { name: 'cil-calendar' },
    children: [
      {
        name: 'Listar Leilões',
        url: '/leiloes/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Leilão',
        url: '/leiloes/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Condições',
    url: '/condicoes',
    iconComponent: { name: 'cil-description' },
    children: [
      {
        name: 'Listar Condições',
        url: '/condicoes/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Condição',
        url: '/condicoes/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },
  {
    name: 'Taxas',
    url: '/taxas',
    iconComponent: { name: 'cil-dollar' },
    children: [
      {
        name: 'Listar Taxas',
        url: '/taxas/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Taxa',
        url: '/taxas/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },

  // ─── Movimentação ─────────────────────────────────────────────
  {
    title: true,
    name: 'Movimentação'
  },
  {
    name: 'Lotes',
    url: '/lotes',
    iconComponent: { name: 'cil-tags' },
    children: [
      {
        name: 'Listar Lotes',
        url: '/lotes/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Lote',
        url: '/lotes/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },

  // ─── Funcionários ─────────────────────────────────────────────
  {
    title: true,
    name: 'Funcionários'
  },
  {
    name: 'Funcionários',
    url: '/funcionarios',
    iconComponent: { name: 'cil-contact' },
    children: [
      {
        name: 'Listar Funcionários',
        url: '/funcionarios/lista',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Cadastrar Funcionário',
        url: '/funcionarios/cadastrar',
        icon: 'nav-icon-bullet'
      }
    ]
  },

  // ─── Comunicação ──────────────────────────────────────────────
  {
    title: true,
    name: 'Comunicação'
  },
  {
    name: 'WhatsApp',
    url: '/whatsapp',
    iconComponent: { name: 'cil-speech' }
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