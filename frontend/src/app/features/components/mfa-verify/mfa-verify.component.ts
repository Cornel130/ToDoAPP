import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

type MfaMethod = 'TOTP' | 'EMAIL';
type Step = 'choose' | 'enter-code' | 'email-sent';

@Component({
  selector: 'app-mfa-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mfa-verify.component.html',
  styleUrl: './mfa-verify.component.css'
})
export class MfaVerifyComponent implements OnInit {
  step = signal<Step>('choose');
  selectedMethod = signal<MfaMethod | null>(null);
  verifyCode = '';
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  emailSent = signal(false);

  private tempToken: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tempToken = sessionStorage.getItem('tempToken') || '';
    if (!this.tempToken) {
      this.router.navigate(['']);
    }
  }

  selectMethod(method: MfaMethod): void {
    this.selectedMethod.set(method);
    this.errorMessage.set(null);
    this.verifyCode = '';

    if (method === 'EMAIL') {
      this.sendEmailCode();
    } else {
      this.step.set('enter-code');
    }
  }

  sendEmailCode(): void {
    this.isLoading.set(true);
    this.authService.sendEmailOtp(this.tempToken).subscribe({
      next: () => {
        this.emailSent.set(true);
        this.isLoading.set(false);
        this.step.set('enter-code');
      },
      error: () => {
        this.errorMessage.set('Could not send email. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  resendEmail(): void {
    this.verifyCode = '';
    this.errorMessage.set(null);
    this.sendEmailCode();
  }

  goBack(): void {
    this.step.set('choose');
    this.selectedMethod.set(null);
    this.verifyCode = '';
    this.errorMessage.set(null);
    this.emailSent.set(false);
  }

  onVerify(): void {
    if (!this.verifyCode || this.verifyCode.length < 6) {
      this.errorMessage.set('Please enter a 6-digit code.');
      return;
    }
    this.errorMessage.set(null);
    this.isLoading.set(true);

    const method = this.selectedMethod() ?? 'TOTP';
    this.authService.verifyMfa(this.verifyCode, method, this.tempToken).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage.set('Invalid or expired code. Please try again.');
        this.verifyCode = '';
        this.isLoading.set(false);
      }
    });
  }
}
