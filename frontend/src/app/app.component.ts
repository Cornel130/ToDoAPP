import { Component } from '@angular/core';
import {MyLoginComponent} from './features/components/my-login/my-login.component';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {RegisterComponent} from './features/components/register/register.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MyLoginComponent, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
