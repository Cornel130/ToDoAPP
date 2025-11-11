import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:9098/api/tasks';

  constructor(private http: HttpClient) {
  }

  getTasksByUserId(userId: number): Observable<Array<{
    id: number;
    title: string;
    description: string;
    status: boolean;
    deadline: string;
  }>> {
    return this.http.get<Array<{
      id: number;
      title: string;
      description: string;
      status: boolean;
      deadline: string;
    }>>(`${this.apiUrl}/by-user/${userId}`);
  }
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }

  addTask(task: {
    title: string;
    description: string;
    deadline: string;
    status: boolean;
    userId: number;
  }): Observable<{
    id: number;
    title: string;
    description: string;
    deadline: string;
    status: boolean;
  }> {
    return this.http.post<any>(`${this.apiUrl}`, task);
  }

}
