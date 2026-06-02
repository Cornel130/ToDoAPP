export interface TaskDTO {
  id: number;
  title: string;
  description: string;
  status: boolean;
  deadline: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: boolean;
  deadline: string;
}
