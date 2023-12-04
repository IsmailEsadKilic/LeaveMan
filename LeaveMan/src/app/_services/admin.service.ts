import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../_models/user';
import { apiUrl } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = apiUrl;

  constructor(private http: HttpClient) { }

  adminpchange(password: string, userName: string) {
    
    return this.http.post<any>(this.baseUrl + 'admin/change-password/' + userName, {newPassword: password});
  }


  getUsersWithRoles() {
    return this.http.get<User[]>(this.baseUrl + 'admin/users-with-roles');
  }

  
  deleteUser(userName: string) {
    return this.http.delete(this.baseUrl + 'admin/delete-user/' + userName);
  }
  
  updateUserRoles(userName: string, roles: string) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' + userName + '?roles=' + roles, {});
  }

  changeUserName(userName: string, newUserName: string) {
    return this.http.post<boolean>(this.baseUrl + 'admin/change-username/' + userName + '?newUserName=' + newUserName.toLowerCase(), {});
  }
}