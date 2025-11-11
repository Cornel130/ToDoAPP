import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskeditService } from '../../services/edit/taskedit.service'; // ✅ serviciu corect
import { TaskDTO } from '../../models/task.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  taskId!: number;
  taskForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private taskEditService: TaskeditService, // ✅ folosește serviciul nou
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

    this.taskEditService.getTaskById(this.taskId).subscribe(task => {
      this.taskForm.patchValue(task);
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const updatedTask: TaskDTO = { id: this.taskId, ...this.taskForm.value };
    this.taskEditService.updateTask(this.taskId, updatedTask).subscribe(() => {
      alert('Task actualizat cu succes!');
      this.router.navigate(['/dashboard']);
    });
  }
}
