import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'categorias', pathMatch: 'full' },
  {
    path: 'categorias',
    loadComponent: () => import('./pages/categorias/categorias/categorias.component')
      .then(m => m.CategoriasComponent)
  },
  {
    path: 'servicios/categoria/:id',
    loadComponent: () => import('./pages/servicios/servicios.component')
      .then(m => m.ServiciosComponent)
  },
  {
    path: 'agendar/servicio',
    loadComponent: () => import('./pages/agenda/agenda.component')
      .then(m => m.AgendaComponent)
  },
];
