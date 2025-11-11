package org.example.backend.dto;


import lombok.Getter;
import lombok.Setter;
import org.example.backend.entity.User;

import java.time.LocalDate;

@Getter
@Setter
public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private boolean status;
    private LocalDate deadline;
    private Integer userId;
}
