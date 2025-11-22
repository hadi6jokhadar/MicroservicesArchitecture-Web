import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser, ICreateUserRequest, IUpdateUserRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private _http = inject(HttpClient);
  private readonly _baseUrl = '/api/admin';

  getUsers(): Observable<IUser[]> {
    return this._http.get<IUser[]>(`${this._baseUrl}/users`);
  }

  getUserById(id: number): Observable<IUser> {
    return this._http.get<IUser>(`${this._baseUrl}/users/${id}`);
  }

  createUser(request: ICreateUserRequest): Observable<object> {
    return this._http.post(`${this._baseUrl}/users`, request);
  }

  updateUser(id: number, request: IUpdateUserRequest): Observable<object> {
    return this._http.put(`${this._baseUrl}/users/${id}`, request);
  }

  toggleUserStatus(id: number): Observable<object> {
    return this._http.patch(`${this._baseUrl}/users/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/users/${id}`);
  }
}
