package org.example.backend.exception;

public class UsernameNotFoundLoginException extends RuntimeException {
    public UsernameNotFoundLoginException(String message) {
        super(message);
    }
}