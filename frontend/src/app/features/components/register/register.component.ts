import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register/register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  hide = signal(true);
  registerForm: FormGroup;
  emailErrorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    const emailControl = this.registerForm.get('email');
    if (emailControl) {
      merge(emailControl.statusChanges, emailControl.valueChanges)
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.updateEmailErrorMessage());
    }
  }

  updateEmailErrorMessage() {
    const control = this.registerForm.get('email');
    if (control?.hasError('required')) {
      this.emailErrorMessage.set('You must enter a value');
    } else if (control?.hasError('email')) {
      this.emailErrorMessage.set('Not a valid email');
    } else {
      this.emailErrorMessage.set('');
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.registerService.register(this.registerForm.value).subscribe({
        next: () => {
          alert('User registered successfully!');
          this.router.navigate(['']);
        },
        error: (err) => {
          console.error('🔴 Full backend error:', err);
          alert('Registration failed: ' + (err.error?.message || JSON.stringify(err.error) || 'Unknown error'));
        }
      });
    } else {
      console.warn('⚠️ Form is invalid:', this.registerForm);
    }
  }
}
