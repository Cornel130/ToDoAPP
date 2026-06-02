import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mfa-setup.component.html',
  styleUrl: './mfa-setup.component.css'
})
export class MfaSetupComponent implements OnInit {
  qrCodeUrl = signal<SafeUrl | null>(null);
  verifyCode = '';
  errorMessage = signal<string | null>(null);
  isLoading = signal(true);
  isVerifying = signal(false);

  private tempToken: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.tempToken = sessionStorage.getItem('tempToken') || '';
    if (!this.tempToken) {
      this.router.navigate(['']);
      return;
    }
    this.loadQrCode();
  }

  loadQrCode(): void {
    this.isLoading.set(true);
    this.authService.getMfaQrCode(this.tempToken).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.qrCodeUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load QR code. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onVerify(): void {
    if (!this.verifyCode || this.verifyCode.length !== 6) {
      this.errorMessage.set('Please enter a 6-digit code.');
      return;
    }
    this.errorMessage.set(null);
    this.isVerifying.set(true);

    this.authService.verifyMfaSetup(this.verifyCode, this.tempToken).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage.set('Invalid code. Please try again.');
        this.verifyCode = '';
        this.isVerifying.set(false);
      }
    });
  }
}
