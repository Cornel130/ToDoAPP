package org.example.backend.dto;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ErrorResponse {
    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final Integer failedAttempts;
    private final Integer maxAttempts;

    public ErrorResponse(LocalDateTime timestamp, int status, String error, String message) {
        this(timestamp, status, error, message, null, null);
    }

    public ErrorResponse(LocalDateTime timestamp,
                         int status,
                         String error,
                         String message,
                         Integer failedAttempts,
                         Integer maxAttempts) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.failedAttempts = failedAttempts;
        this.maxAttempts = maxAttempts;
    }
}