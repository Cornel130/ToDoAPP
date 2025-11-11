import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task/task.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    DatePipe,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks: Array<{
    id: number;
    title: string;
    description: string;
    status: boolean;
    deadline: string;
  }> = [];

  showAddForm = false;

  newTask = {
    title: '',
    description: '',
    deadline: ''
  };

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      alert('Sesiunea a expirat. Te rugăm să te loghezi din nou.');
      this.router.navigate(['']);
      return;
    }

    const userId = +userIdStr;
    this.taskService.getTasksByUserId(userId).subscribe(data => {
      this.tasks = data;
    });
  }

  toggleAddTask(): void {
    this.showAddForm = !this.showAddForm;
  }

  submitTask(): void {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) return;
    const userId = +userIdStr;

    const taskToSend = {
      ...this.newTask,
      userId,
      status: false
    };

    this.taskService.addTask(taskToSend).subscribe({
      next: (createdTask) => {
        this.tasks.push(createdTask);
        this.newTask = { title: '', description: '', deadline: '' };
        this.showAddForm = false;
      },
      error: err => {
        console.error('Eroare la salvarea taskului:', err);
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Sigur vrei să ștergi acest task?')) {
      this.taskService.deleteTask(taskId).subscribe(() => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
      });
    }
  }

  editTask(taskId: number): void {
    this.router.navigate(['/edit-task', taskId]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['']);
  }

  sortByDeadline(): void {
    this.tasks.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    });
  }

}
