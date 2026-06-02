package org.example.backend.repo;

import org.example.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByUserId(Integer userId);
    Optional<Task> findByIdAndUserId(Integer id, Integer userId);
}