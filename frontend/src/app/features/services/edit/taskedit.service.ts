import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDTO } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskeditService {
  private apiUrl = 'http://localhost:9098/api/tasks'; // ajustează dacă e nevoie

  constructor(private http: HttpClient) {}

  getTaskById(taskId: number): Observable<TaskDTO> {
    return this.http.get<TaskDTO>(`${this.apiUrl}/${taskId}`);
  }

  updateTask(taskId: number, updatedTask: TaskDTO): Observable<TaskDTO> {
    return this.http.put<TaskDTO>(`${this.apiUrl}/${taskId}`, updatedTask);
  }
}
