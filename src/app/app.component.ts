import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, SidebarComponent],
})
export class AppComponent {
  isAuthenticated = false;
  isSidebarHidden = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const current = event.urlAfterRedirects;
        this.isAuthenticated = !(current.includes('login') || current.includes('register'));
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.isSidebarHidden = window.innerWidth <= 992;
  }

  ngOnInit() {
    this.onResize(); // initial check
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getPageTitle() {
    const path = this.router.url;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('expenses')) return 'Expenses';
    if (path.includes('analytics')) return 'Analytics';
    return 'Expense Manager';
  }
}
