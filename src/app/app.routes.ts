import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'categorias', pathMatch: 'full' },
  {
    path: 'categorias',
    loadComponent: () => import('./pages/categorias/categorias/categorias.component')
      .then(m => m.CategoriasComponent)
  },
];
