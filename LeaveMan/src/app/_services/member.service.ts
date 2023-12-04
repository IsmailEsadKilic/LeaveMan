import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Member } from '../_models/member';
import { User } from '../_models/user';
import { config } from 'rxjs';
import { apiUrl } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  baseUrl = apiUrl;

  constructor(private http: HttpClient) { }

  getMemberByUserName(userName: string) {
    return this.http.get<Member>(this.baseUrl + 'submissions/' + userName);
  }

  getUsersWithRoles() {
    return this.http.get<User[]>(this.baseUrl + 'admin/users-with-roles');
  }


}
