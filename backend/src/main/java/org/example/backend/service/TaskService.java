package org.example.backend.service;

import org.example.backend.dto.TaskDTO;
import org.example.backend.entity.Task;
import org.example.backend.entity.User;
import org.example.backend.repo.TaskRepository;
import org.example.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TaskDTO> getTasksByUserId(Integer userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);

        return tasks.stream().map(task -> {
            TaskDTO dto = new TaskDTO();
            dto.setId(task.getId());
            dto.setTitle(task.getTitle());
            dto.setDescription(task.getDescription());
            dto.setStatus(task.isStatus());
            dto.setDeadline(task.getDeadline());
            dto.setUserId(userId);
            return dto;
        }).collect(Collectors.toList());
    }


    public TaskDTO createTask(TaskDTO dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDeadline(dto.getDeadline());
        task.setStatus(dto.isStatus());

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setUser(user);

        Task saved = taskRepository.save(task);

        dto.setId(saved.getId()); // update dto with generated ID
        return dto;
    }
}
