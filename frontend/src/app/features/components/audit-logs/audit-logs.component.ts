import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuditLogService } from '../../services/audit-log/audit-log.service';
import { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  imports: [CommonModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  errorMessage: string = '';
  loading: boolean = true;

  constructor(
    private auditLogService: AuditLogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = sessionStorage.getItem('role');
    if (role !== 'ROLE_ADMIN') {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.auditLogService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load audit logs.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getBadgeClass(action: string): string {
    if (action === 'ACCOUNT_LOCKED') return 'badge-danger';
    if (action === 'LOGIN_FAILED' || action === 'MFA_VERIFY_FAILED') return 'badge-warning';
    if (action === 'USER_LOGOUT') return 'badge-logout';
    if (action === 'USER_REGISTER') return 'badge-register';
    if (action === 'MFA_ENABLED') return 'badge-mfa-enabled';
    if (action === 'MFA_DISABLED') return 'badge-mfa-disabled';
    if (action === 'ACCOUNT_UNLOCKED') return 'badge-unlocked';
    return 'badge-login';
  }
}
