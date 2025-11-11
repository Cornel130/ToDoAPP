import { Component } from '@angular/core';
import {User} from '../../models/user.model';
import {LoginService} from '../../services/login/login.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MyLoginComponent} from '../my-login/my-login.component';

@Component({
  selector: 'app-login-service',
  imports: [
    MyLoginComponent
  ],
  templateUrl: './login-service.component.html',
  styleUrl: './login-service.component.css'
})
export class LoginServiceComponent {

  constructor(private loginService:LoginService, private _snackBar: MatSnackBar) {

  }

  loginUser(user: User) {
    this.loginService.login(user).subscribe(result => {
      console.log(result);
      // localStorage.setItem('token', JSON.stringify(result));
      // this.loginService.loginState.next(true);
      this._snackBar.open("Hello! You were successfully logged in!", 'OK', {
        duration: 10000,
        panelClass: 'success-snackbar'
      })
      // this.router.navigate(["/home"]); !!INCA NU EXISTA VA FI DASHBOARD -UL PENTRU taskurile date de user
    }, e => {
      this._snackBar.open(e.error.message, 'OK', {
        duration: 10000,
        panelClass: 'fail-snackbar'
      })
      console.log(e);
    })
  };
}
