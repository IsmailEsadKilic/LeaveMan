import { Injectable } from '@angular/core';
import { apiUrl } from '../app.config';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_models/user';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { login } from '../_models/login';
import { Register } from '../_models/register';

interface changeDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  login(login: login) {
    return this.http.post<User>(this.baseUrl + 'account/login', login).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  changePassword(cd : changeDto) {
    console.log("cd: ", cd);
    return this.http.post<any>(this.baseUrl + 'account/change-password', cd)
  }

  register(register: Register, role: string) {
    return this.http.post<User>(this.baseUrl + 'account/register', register).pipe(
      map(user => {
        if(user) {
          this.toastr.success(`${user.userName} kaydedildi.`);
          console.log("register: ", user);
          return true;
        }
        return false;
      })
    )
  }


  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);  
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}