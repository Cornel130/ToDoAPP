import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task/task.service';
import { TaskRequest } from '../../models/task.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  templateUrl: './edit-task.component.html',
  imports: [ReactiveFormsModule, NgIf],
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  taskId!: number;
  taskForm!: FormGroup;
  minDate: string = new Date().toISOString().split('T')[0];
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskId = +this.route.snapshot.paramMap.get('id')!;

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadline: ['', Validators.required],
      status: [false]
    });

    this.taskService.getTaskById(this.taskId).subscribe(task => {
      this.taskForm.patchValue(task);
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const deadline = this.taskForm.value.deadline;

    if (deadline && deadline < this.minDate) {
      this.errorMessage = 'Deadline cannot be in the past.';
      return;
    }

    const updatedTask: TaskRequest = this.taskForm.value;

    this.taskService.updateTask(this.taskId, updatedTask).subscribe({
      next: () => {
        alert('Task actualizat cu succes!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update task.';
      }
    });
  }
}
