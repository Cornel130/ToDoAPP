package org.example.backend.service;

import org.example.backend.dto.TaskDTO;
import org.example.backend.entity.Task;
import org.example.backend.repo.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TaskEdit {

    @Autowired
    private TaskRepository taskRepository;

    public ResponseEntity<TaskDTO> updateTask(Integer id, TaskDTO taskDTO) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setTitle(taskDTO.getTitle());
            task.setDescription(taskDTO.getDescription());
            task.setDeadline(taskDTO.getDeadline());
            task.setStatus(taskDTO.isStatus());
            taskRepository.save(task);
            return ResponseEntity.ok(taskDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<TaskDTO> getTaskById(Integer id) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            TaskDTO dto = new TaskDTO();
            dto.setId(task.getId());
            dto.setTitle(task.getTitle());
            dto.setDescription(task.getDescription());
            dto.setDeadline(task.getDeadline());
            dto.setStatus(task.isStatus());
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
