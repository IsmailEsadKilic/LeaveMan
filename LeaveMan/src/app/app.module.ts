import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { TextInputComponent } from './text-input/text-input.component';
import { AppComponent } from './app.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { HasRoleDirective } from './_directives/has-role.directive';
import { AdminComponent } from './admin/admin.component';
import { SearchUserPipe } from './_pipes/search-user.pipe';
import { HomeComponent } from './home/home.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { ErrorInterceptor } from './_interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    TextInputComponent,
    HasRoleDirective,
    AdminComponent,
    SearchUserPipe,
    HomeComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
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
  providers: [
    {provide: HTTP_INTERCEPTORS , useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS , useClass: JwtInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
