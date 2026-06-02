package org.example.backend.exception;

public class InvalidPasswordException extends RuntimeException {

    private final int failedAttempts;
    private final int maxAttempts;

    public InvalidPasswordException(String message, int failedAttempts, int maxAttempts) {
        super(message);
        this.failedAttempts = failedAttempts;
        this.maxAttempts = maxAttempts;
    }

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }
}