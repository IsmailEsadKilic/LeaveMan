import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { TextInputComponent } from './text-input/text-input.component';
import { AppComponent } from './app.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { HasRoleDirective } from './_directives/has-role.directive';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    TextInputComponent,
    HasRoleDirective,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      routes,
    ),
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
