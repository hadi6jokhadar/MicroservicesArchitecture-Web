import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
  UserClass,
  IRefreshTokenRequest,
  IForgotPasswordRequest,
  IVerificationCodeResponse,
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

  login(
    request: ILoginRequest,
    context?: HttpContext
  ): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/login`, request, { context })
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  register(
    request: IRegisterRequest,
    context?: HttpContext
  ): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/register`, request, { context })
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  refreshToken(request: IRefreshTokenRequest): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/refresh`, request)
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  forgotPassword(
    request: IForgotPasswordRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http.post(`${this._baseUrl}/forgot-password`, request, {
      context,
    });
  }

  logout(): Observable<object> {
    return this._http
      .post(`${this._baseUrl}/logout`, {})
      .pipe(tap(() => this._clearAuth()));
  }

  // Verification Code Methods
  getVerificationCodeByPhone(
    phoneNumber: string
  ): Observable<IVerificationCodeResponse> {
    return this._http.post<IVerificationCodeResponse>(
      `${this._baseUrl}/get-verification-code-by-phone`,
      { phoneNumber }
    );
  }

  getVerificationCodeByEmail(
    email: string
  ): Observable<IVerificationCodeResponse> {
    return this._http.post<IVerificationCodeResponse>(
      `${this._baseUrl}/get-verification-code-by-email`,
      { email }
    );
  }

  loginWithCodeByPhone(
    phoneNumber: string,
    verificationCode: string
  ): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/login-with-code-by-phone`, {
        phoneNumber,
        verificationCode,
      })
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  loginWithCodeByEmail(
    email: string,
    verificationCode: string
  ): Observable<IAuthResponse> {
    return this._http
      .post<IAuthResponse>(`${this._baseUrl}/login-with-code-by-email`, {
        email,
        verificationCode,
      })
      .pipe(tap((response) => this._handleAuthResponse(response)));
  }

  registerWithCodeByPhone(
    phoneNumber: string,
    firstName: string,
    lastName: string,
    data?: string
  ): Observable<IVerificationCodeResponse> {
    return this._http.post<IVerificationCodeResponse>(
      `${this._baseUrl}/register-with-code-by-phone`,
      {
        phoneNumber,
        firstName,
        lastName,
        data,
      }
    );
  }

  registerWithCodeByEmail(
    email: string,
    firstName: string,
    lastName: string,
    data?: string
  ): Observable<IVerificationCodeResponse> {
    return this._http.post<IVerificationCodeResponse>(
      `${this._baseUrl}/register-with-code-by-email`,
      {
        email,
        firstName,
        lastName,
        data,
      }
    );
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
