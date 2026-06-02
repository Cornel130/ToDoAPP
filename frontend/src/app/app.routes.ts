import { Routes } from '@angular/router';
import { MyLoginComponent } from './features/components/my-login/my-login.component';
import { RegisterComponent } from './features/components/register/register.component';
import { DashboardComponent } from './features/components/dashboard/dashboard.component';
import { EditTaskComponent } from './features/components/edit-task/edit-task.component';
import { MfaSetupComponent } from './features/components/mfa-setup/mfa-setup.component';
import { MfaVerifyComponent } from './features/components/mfa-verify/mfa-verify.component';
import { AuditLogsComponent } from './features/components/audit-logs/audit-logs.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: MyLoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'mfa-setup', component: MfaSetupComponent },
  { path: 'mfa-verify', component: MfaVerifyComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'edit-task/:id', component: EditTaskComponent, canActivate: [authGuard] },
  { path: 'audit-logs', component: AuditLogsComponent, canActivate: [authGuard] }
];
