import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}

  login(user: User): Observable<{ id: number; username: string }> {
    return this.http.post<{ id: number; username: string }>(
      'http://localhost:9098/api/users/login',
      user
    );
  }
}

