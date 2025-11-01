import { CanActivateFn, Router, Routes } from '@angular/router';
import { DashboardContentComponent } from './components/dashboard-content/dashboard-content.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';

import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { LoginComponent } from './pages/Auth/Login/login.component';
import { RegisterComponent } from './pages/Auth/Register/register.component';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = localStorage.getItem('user');
  if (user) return true;
  router.navigate(['/login']);
  return false;
};
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardContentComponent, canActivate: [authGuard] },
  { path: 'expenses', component: ExpensesComponent, canActivate: [authGuard] },
  {
    path: 'analytics',
    component: AnalyticsComponent,canActivate:[authGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];