package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class TaskResponse {
    private Integer id;
    private String title;
    private String description;
    private boolean status;
    private LocalDate deadline;
}