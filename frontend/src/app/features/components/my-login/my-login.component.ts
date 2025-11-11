import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { User } from '../../models/user.model';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatButtonModule
} from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-my-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    // RouterOutlet
  ],
  templateUrl: './my-login.component.html',
  styleUrls: ['./my-login.component.css']
})
export class MyLoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  errorMessage = signal<string | null>(null);

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit(formDirective: FormGroupDirective) {
    const user = this.loginForm.value as User;

    this.loginService.login(user).subscribe({
      next: (response) => {
        console.log('Răspuns login:', response); // debug
        localStorage.setItem('userId', response.id.toString());
        localStorage.setItem('username', response.username);
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('Login failed:', error); // Log full error
        if (error.status === 0) {
          alert('Backend is unreachable. Is Spring Boot running? Is CORS allowed?');
        } else {
          alert('Login failed: ' + error.error);
        }
      }

    });

    this.loginForm.reset();
    formDirective.resetForm();
  }
}
