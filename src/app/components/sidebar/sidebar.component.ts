import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isMobileMenuOpen = false;

menuItems = [
  { name: 'Dashboard', route: '/dashboard', icon: '<i class="fa fa-chart-pie"></i>' },
  { name: 'Expenses', route: '/expenses', icon: '<i class="fa fa-wallet"></i>' },
  { name: 'Reports', route: '/analytics', icon: '<i class="fa fa-file-alt"></i>' },
  { name: 'Help Center', route: '/help-center', icon: '<i class="fa fa-circle-question"></i>' },
  { name: 'Settings', route: '/setting', icon: '<i class="fa fa-cog"></i>' }
];


  constructor(private router: Router) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getIcon(icon: string) {
    return icon;
  }  
  
}

