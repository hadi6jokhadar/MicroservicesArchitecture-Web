import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
  UserClass,
  IRefreshTokenRequest,
  IForgotPasswordRequest,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/auth`;

  currentUser = signal<UserClass | null>(null);

  constructor() {
    this._loadUserFromStorage();
  }

  login(request: ILoginRequest): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/login`, request)
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  register(request: IRegisterRequest): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/register`, request)
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  refreshToken(request: IRefreshTokenRequest): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/refresh`, request)
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  forgotPassword(request: IForgotPasswordRequest): Observable<object> {
    return this._http.post(`${this._baseUrl}/forgot-password`, request);
  }

  logout(): Observable<object> {
    return this._http
      .post(`${this._baseUrl}/logout`, {})
      .pipe(tap(() => this._clearAuth()));
  }

  // Verification Code Methods
  getVerificationCodeByPhone(phoneNumber: string): Observable<object> {
    return this._http.post(`${this._baseUrl}/get-verification-code-by-phone`, {
      phoneNumber,
    });
  }

  getVerificationCodeByEmail(email: string): Observable<object> {
    return this._http.post(`${this._baseUrl}/get-verification-code-by-email`, {
      email,
    });
  }

  loginWithCodeByPhone(
    phoneNumber: string,
    code: string
  ): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/login-with-code-by-phone`, {
        phoneNumber,
        code,
      })
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  loginWithCodeByEmail(email: string, code: string): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/login-with-code-by-email`, {
        email,
        code,
      })
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  private _handleAuthResponse(response: IAuthResponse) {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    this.currentUser.set(new UserClass(response.user));
  }

  private _clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUser.set(null);
  }

  private _loadUserFromStorage() {
    // Only load user if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUser.set(null);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}
