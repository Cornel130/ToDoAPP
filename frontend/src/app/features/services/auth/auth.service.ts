import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../../models/login-request.model';
import { RegisterRequest } from '../../models/register-request.model';
import { AuthResponse } from '../../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9098/api/auth';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (!response.mfaRequired && response.token) {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('username', response.username);
          sessionStorage.setItem('role', response.role);
          sessionStorage.setItem('mfaEnabled', String(!!response.mfaConfigured));
        } else if (response.tempToken) {
          sessionStorage.setItem('tempToken', response.tempToken);
        }
      })
    );
  }

  saveFinalToken(response: AuthResponse): void {
    if (response.token) {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('username', response.username);
      sessionStorage.setItem('role', response.role);
      sessionStorage.setItem('mfaEnabled', String(!!response.mfaConfigured));
      sessionStorage.removeItem('tempToken');
    }
  }

  isMfaEnabled(): boolean {
    return sessionStorage.getItem('mfaEnabled') === 'true';
  }

  verifyMfaSetup(code: string, tempToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/mfa/setup/verify`, { code, tempToken }).pipe(
      tap(response => this.saveFinalToken(response))
    );
  }

  verifyMfa(code: string, method: string, tempToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/mfa/verify`, { code, method, tempToken }).pipe(
      tap(response => this.saveFinalToken(response))
    );
  }

  sendEmailOtp(tempToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mfa/email/send`, { tempToken });
  }

  getMfaQrCode(tempToken: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/mfa/qr?tempToken=${tempToken}`, { responseType: 'blob' });
  }

  enableMfa(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mfa/enable`, {});
  }

  disableMfa(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mfa/disable`, {});
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => this.clearLocalState(),
        error: () => this.clearLocalState()
      });
    } else {
      this.clearLocalState();
    }
  }

  private clearLocalState(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('mfaEnabled');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
