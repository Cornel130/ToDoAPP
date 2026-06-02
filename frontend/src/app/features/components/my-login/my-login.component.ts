import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-my-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './my-login.component.html',
  styleUrls: ['./my-login.component.css']
})
export class MyLoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(4)]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData = {
      username: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? ''
    };

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        if (response && response.mfaRequired) {
          if (response.mfaConfigured) {
            this.router.navigate(['/mfa-verify']);
          } else {
            this.router.navigate(['/mfa-setup']);
          }
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        if (error.status === 423) {
          this.errorMessage.set(
            error.error?.message ||
            'Your account is temporarily locked due to multiple failed login attempts. Try again later.'
          );
        } else if (error.status === 400 || error.status === 401) {
          const backendMessage = error.error?.message;

          if (backendMessage === 'Username does not exist') {
            this.errorMessage.set('Username does not exist');
          } else if (backendMessage === 'Invalid password') {
            this.errorMessage.set('Invalid password');
          } else {
            this.errorMessage.set(backendMessage || 'Login failed');
          }
        } else {
          this.errorMessage.set(
            error.error?.message || 'Login failed. Please try again.'
          );
        }
      }
    });
  }
}
