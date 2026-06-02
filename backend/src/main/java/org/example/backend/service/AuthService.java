package org.example.backend.service;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.RegisterRequest;
import org.example.backend.entity.User;
import org.example.backend.exception.AccountLockedException;
import org.example.backend.exception.InvalidPasswordException;
import org.example.backend.exception.UsernameNotFoundLoginException;
import org.example.backend.repo.UserRepository;
import org.example.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    @Value("${app.security.max-failed-attempts}")
    private int maxFailedAttempts;

    @Value("${app.security.lock-duration-minutes}")
    private long lockDurationMinutes;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setFailedLoginAttempts(0);
        user.setAccountNonLocked(true);
        user.setLockTime(null);

        userRepository.save(user);
        auditLogService.logAction(user.getUsername(), "USER_REGISTER", "User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundLoginException("Username does not exist"));

        if (!Boolean.TRUE.equals(user.getAccountNonLocked())) {
            if (user.getLockTime() != null &&
                    !user.getLockTime().plusMinutes(lockDurationMinutes).isAfter(LocalDateTime.now())) {
                unlockAccount(user);
            } else {
                throw new AccountLockedException(
                        "Your account is temporarily locked due to multiple failed login attempts. Try again later."
                );
            }
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = increaseFailedAttempts(user);

            if (attempts >= maxFailedAttempts) {
                auditLogService.logAction(user.getUsername(), "ACCOUNT_LOCKED",
                        "Locked after " + attempts + " failed attempts");
                throw new AccountLockedException(
                        "Your account is temporarily locked due to multiple failed login attempts. Try again later."
                );
            }

            auditLogService.logAction(user.getUsername(), "LOGIN_FAILED",
                    "Wrong password, attempt " + attempts + "/" + maxFailedAttempts);
            throw new InvalidPasswordException(
                    "Invalid password",
                    attempts,
                    maxFailedAttempts
            );
        }

        resetFailedAttempts(user);

        if (Boolean.TRUE.equals(user.getMfaEnabled()) || user.getMfaSecret() != null) {
            String tempToken = jwtService.generateTempToken(user);
            return new AuthResponse(null, user.getUsername(), null, true, Boolean.TRUE.equals(user.getMfaEnabled()), tempToken);
        }

        String token = jwtService.generateToken(user);
        auditLogService.logAction(user.getUsername(), "USER_LOGIN", "User logged in successfully");
        return new AuthResponse(token, user.getUsername(), user.getRole(), false, false, null);
    }

    private int increaseFailedAttempts(User user) {
        int newAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(newAttempts);

        if (newAttempts >= maxFailedAttempts) {
            user.setAccountNonLocked(false);
            user.setLockTime(LocalDateTime.now());
        }

        userRepository.save(user);
        return newAttempts;
    }

    private void resetFailedAttempts(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountNonLocked(true);
        user.setLockTime(null);
        userRepository.save(user);
    }

    private void unlockAccount(User user) {
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);
        auditLogService.logAction(user.getUsername(), "ACCOUNT_UNLOCKED", "Account unlocked");
    }
}