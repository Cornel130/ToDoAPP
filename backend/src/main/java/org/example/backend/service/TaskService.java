package org.example.backend.service;

import org.example.backend.dto.TaskRequest;
import org.example.backend.dto.TaskResponse;
import org.example.backend.entity.Task;
import org.example.backend.entity.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.exception.UnauthorizedAccessException;
import org.example.backend.repo.TaskRepository;
import org.example.backend.repo.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository, AuditLogService auditLogService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<TaskResponse> getMyTasks() {
        User currentUser = getCurrentUser();

        return taskRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TaskResponse getMyTaskById(Integer id) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new UnauthorizedAccessException("You are not allowed to access this task"));

        return mapToResponse(task);
    }

    public TaskResponse createTask(TaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setStatus(request.isStatus());
        task.setUser(currentUser);

        Task savedTask = taskRepository.save(task);
        auditLogService.logAction(currentUser.getUsername(), "TASK_CREATE", "Created task with ID: " + savedTask.getId() + " and Title: " + savedTask.getTitle());
        return mapToResponse(savedTask);
    }

    public TaskResponse updateTask(Integer id, TaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new UnauthorizedAccessException("You are not allowed to update this task"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setStatus(request.isStatus());

        Task updatedTask = taskRepository.save(task);
        auditLogService.logAction(currentUser.getUsername(), "TASK_UPDATE", "Updated task with ID: " + updatedTask.getId() + " and Title: " + updatedTask.getTitle());
        return mapToResponse(updatedTask);
    }

    public void deleteTask(Integer id) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new UnauthorizedAccessException("You are not allowed to delete this task"));

        taskRepository.delete(task);
        auditLogService.logAction(currentUser.getUsername(), "TASK_DELETE", "Deleted task with ID: " + id);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isStatus(),
                task.getDeadline()
        );
    }
}