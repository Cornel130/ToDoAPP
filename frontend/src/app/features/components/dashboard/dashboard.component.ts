import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task/task.service';
import { FormsModule } from '@angular/forms';
import { TaskDTO, TaskRequest } from '../../models/task.model';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks: TaskDTO[] = [];
  showAddForm = false;
  minDate: string = new Date().toISOString().split('T')[0];
  errorMessage: string = '';
  isAdmin: boolean = false;
  mfaEnabled: boolean = false;

  newTask: TaskRequest = {
    title: '',
    description: '',
    deadline: '',
    status: false
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';
    this.mfaEnabled = this.authService.isMfaEnabled();
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getMyTasks().subscribe({
      next: data => this.tasks = data,
      error: err => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['']);
        }
      }
    });
  }

  toggleAddTask(): void {
    this.showAddForm = !this.showAddForm;
    this.errorMessage = '';
  }

  submitTask(): void {
    this.errorMessage = '';

    if (this.newTask.deadline && this.newTask.deadline < this.minDate) {
      this.errorMessage = 'Deadline cannot be in the past.';
      return;
    }

    this.taskService.addTask(this.newTask).subscribe({
      next: (createdTask) => {
        this.tasks.push(createdTask);
        this.newTask = { title: '', description: '', deadline: '', status: false };
        this.showAddForm = false;
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Failed to create task.';
      }
    });
  }

  deleteTask(taskId: number): void {
    if (!confirm('Sigur vrei să ștergi acest task?')) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
      }
    });
  }

  editTask(taskId: number): void {
    this.router.navigate(['/edit-task', taskId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }

  sortByDeadline(): void {
    this.tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  enableMfa(): void {
    if (!confirm('Dorești să activezi autentificarea în 2 pași? Vei fi redirecționat pentru configurare.')) return;
    
    this.authService.enableMfa().subscribe({
      next: (res: any) => {
        if (res && res.tempToken) {
          sessionStorage.setItem('tempToken', res.tempToken);
          this.router.navigate(['/mfa-setup']);
        }
      },
      error: err => {
        alert(err.error?.message || 'A apărut o eroare la activarea MFA.');
      }
    });
  }

  disableMfa(): void {
    if (!confirm('Sigur vrei să DEZACTIVEZI autentificarea în 2 pași? Contul tău va fi mai puțin sigur.')) return;

    this.authService.disableMfa().subscribe({
      next: () => {
        sessionStorage.setItem('mfaEnabled', 'false');
        this.mfaEnabled = false;
        alert('MFA a fost dezactivat cu succes.');
      },
      error: err => {
        alert(err.error?.message || 'A apărut o eroare la dezactivarea MFA.');
      }
    });
  }
}
