import { Routes } from '@angular/router';
import {MyLoginComponent} from './features/components/my-login/my-login.component';
import {RegisterComponent} from './features/components/register/register.component';
import {DashboardComponent} from './features/components/dashboard/dashboard.component';
import {EditTaskComponent} from './features/components/edit-task/edit-task.component';

export const routes: Routes = [
  {path: '', component: MyLoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'dashboard',component: DashboardComponent},
  { path: 'edit-task/:id', component: EditTaskComponent }

];
