import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { inject } from '@angular/core';
import { AuthGuard } from './_guards/auth.guard';
import { AdminComponent } from './admin/admin.component';


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: '',
      runGuardsAndResolvers: 'always',
      canActivate: [() => inject(AuthGuard).canActivate()],
      children: [
        {path: 'admin', component: AdminComponent},
      ]
    },
    {path: '**', component: HomeComponent, pathMatch: 'full'}
  ];