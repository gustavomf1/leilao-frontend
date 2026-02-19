import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = false;

  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/app/dashboard' },
    { label: 'Clientes', icon: '👤', route: '/app/clientes' },
    { label: 'Fazendas', icon: '🏡', route: '/app/fazendas' },
    { label: 'Leilões', icon: '🔨', route: '/app/leiloes' },
    { label: 'Condições', icon: '📋', route: '/app/condicoes' },
    { label: 'Taxas', icon: '💰', route: '/app/taxas' },
    { label: 'Lotes', icon: '🐄', route: '/app/lotes' },
  ];

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
