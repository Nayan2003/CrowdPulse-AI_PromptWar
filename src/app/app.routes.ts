// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview',  loadComponent: () => import('./components/heatmap/heatmap.component').then(m => m.HeatmapComponent) },
      { path: 'gates',     loadComponent: () => import('./components/gates/gates.component').then(m => m.GatesComponent) },
      { path: 'food',      loadComponent: () => import('./components/food/food.component').then(m => m.FoodComponent) },
      { path: 'alerts',    loadComponent: () => import('./components/alerts/alerts.component').then(m => m.AlertsComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
