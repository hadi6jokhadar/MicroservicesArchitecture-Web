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
  IUser,
} from './models';

import { IdentityStorageService } from './identity-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private _identityStorage = inject(IdentityStorageService);
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
  ): Observable<string> {
    return this._http.post<string>(
      `${this._baseUrl}/forgot-password`,
      request,
      {
        context,
      }
    );
  }

  logout(): Observable<void> {
    return this._http
      .post<void>(`${this._baseUrl}/logout`, {})
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
    this._identityStorage.setAccessToken(response.accessToken);
    this._identityStorage.setRefreshToken(response.refreshToken);
    this.currentUser.set(new UserClass(response.user));
  }

  private _clearAuth() {
    this._identityStorage.clearAuth();
    this.currentUser.set(null);
  }

  getProfile(): Observable<IUser> {
    return this._http.get<IUser>(
      `${this._env.apiUrls.identity}/api/user/profile`
    );
  }

  private _loadUserFromStorage() {
    const token = this._identityStorage.getAccessToken();
    if (token) {
      this.getProfile().subscribe({
        next: (user) => this.currentUser.set(new UserClass(user)),
        error: (error) => {
          console.error(error);

          if (error.status === 401) {
            this._clearAuth();
          }
        },
      });
    } else {
      this.currentUser.set(null);
    }
  }

  getToken(): string | null {
    return this._identityStorage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this._identityStorage.getRefreshToken();
  }
}
