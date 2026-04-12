import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { IconDirective } from '@coreui/icons-angular';
import { INavData } from '@coreui/angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';
import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems, navItemsLeilao, navItemsManejo } from './_nav';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultHeaderComponent,
    IconDirective,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective,
    ConfirmModalComponent
  ]
})
export class DefaultLayoutComponent implements OnInit {
  private authService = inject(AuthService);

  public navItems = [...navItems];
  public filteredNavItems: INavData[] = [];

  ngOnInit() {
    if (this.authService.isManejo()) {
      this.filteredNavItems = [...navItemsManejo];
    } else {
      this.filteredNavItems = this.filterNavItems(navItemsLeilao);
    }
  }

  private filterNavItems(items: INavData[]): INavData[] {
    const isAdmin = this.authService.isAdmin();

    return items
      .map(item => this.filterItem(item, isAdmin))
      .filter((item): item is INavData => item !== null);
  }

  private filterItem(item: INavData, isAdmin: boolean): INavData | null {
    // Admin vê tudo
    if (isAdmin) return item;

    const attrs = item.attributes as Record<string, string> | undefined;

    // Itens exclusivos de admin
    if (attrs?.['adminOnly'] === 'true') return null;

    // Item com children: filtrar filhos primeiro
    if (item.children && item.children.length > 0) {
      const filteredChildren = item.children
        .map(child => this.filterItem(child, isAdmin))
        .filter((child): child is INavData => child !== null);

      if (filteredChildren.length === 0) return null;
      return { ...item, children: filteredChildren };
    }

    // Títulos de seção: verificar se algum ambiente da seção tem qualquer permissão
    if (item.title) {
      if (attrs?.['ambiente']) {
        return this.hasAnyPermissionForAmbiente(attrs['ambiente']) ? item : null;
      }
      if (attrs?.['ambientes']) {
        const ambientes = attrs['ambientes'].split(',');
        return ambientes.some(a => this.hasAnyPermissionForAmbiente(a)) ? item : null;
      }
      return item;
    }

    // Item com acao específica
    if (attrs?.['acao'] && attrs?.['ambiente']) {
      return this.authService.hasPermission(attrs['ambiente'], attrs['acao']) ? item : null;
    }

    // Item com ambiente mas sem acao: mostrar se tem qualquer permissão nesse ambiente
    if (attrs?.['ambiente']) {
      return this.hasAnyPermissionForAmbiente(attrs['ambiente']) ? item : null;
    }

    // Sem restrição
    return item;
  }

  private hasAnyPermissionForAmbiente(ambiente: string): boolean {
    const permissoes = this.authService.getPermissoes();
    return permissoes.some(p => p.startsWith(ambiente + ':'));
  }
}
