package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="tasks")
@Getter
@Setter
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="title")
    private String title;
    @Column(name="description")
    private String description;
    @Column(name="status")
    private boolean status;
    @Column(name="deadline")
    private LocalDate deadline;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
