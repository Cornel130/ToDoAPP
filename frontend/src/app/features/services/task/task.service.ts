import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDTO, TaskRequest } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:9098/api/tasks';

  constructor(private http: HttpClient) {}

  getMyTasks(): Observable<TaskDTO[]> {
    return this.http.get<TaskDTO[]>(`${this.apiUrl}/me`);
  }

  getTaskById(taskId: number): Observable<TaskDTO> {
    return this.http.get<TaskDTO>(`${this.apiUrl}/${taskId}`);
  }

  addTask(task: TaskRequest): Observable<TaskDTO> {
    return this.http.post<TaskDTO>(this.apiUrl, task);
  }

  updateTask(taskId: number, task: TaskRequest): Observable<TaskDTO> {
    return this.http.put<TaskDTO>(`${this.apiUrl}/${taskId}`, task);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }
}
