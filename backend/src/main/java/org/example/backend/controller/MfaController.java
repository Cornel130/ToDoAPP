package org.example.backend.controller;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.MfaEmailSendRequest;
import org.example.backend.dto.MfaSetupVerifyRequest;
import org.example.backend.dto.MfaVerifyRequest;
import org.example.backend.entity.User;
import org.example.backend.repo.UserRepository;
import org.example.backend.security.JwtService;
import org.example.backend.service.MfaService;
import org.example.backend.service.AuditLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/mfa")
public class MfaController {

    private final MfaService mfaService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public MfaController(MfaService mfaService, JwtService jwtService, UserRepository userRepository, AuditLogService auditLogService) {
        this.mfaService = mfaService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    private User getUserFromTempToken(String tempToken) {
        if (!jwtService.isTempToken(tempToken)) {
            throw new RuntimeException("Invalid temporary token");
        }
        String username = jwtService.extractUsername(tempToken);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping(value = "/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCode(@RequestParam String tempToken) throws Exception {
        User user = getUserFromTempToken(tempToken);
        byte[] qrCode = mfaService.generateQrCodePng(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"qrcode.png\"")
                .body(qrCode);
    }

    @PostMapping("/setup/verify")
    public ResponseEntity<?> verifySetup(@RequestBody MfaSetupVerifyRequest request) {
        User user = getUserFromTempToken(request.getTempToken());
        if (mfaService.verifyTotp(user, request.getCode())) {
            mfaService.enableMfa(user);
            String finalToken = jwtService.generateToken(user);
            auditLogService.logAction(user.getUsername(), "MFA_ENABLED", "MFA enabled");
            auditLogService.logAction(user.getUsername(), "USER_LOGIN", "User logged in successfully");
            return ResponseEntity.ok(new AuthResponse(finalToken, user.getUsername(), user.getRole(), false, true, null));
        }
        auditLogService.logAction(user.getUsername(), "MFA_VERIFY_FAILED", "Invalid TOTP code");
        return ResponseEntity.badRequest().body(Map.of("message", "Cod invalid sau expirat"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody MfaVerifyRequest request) {
        User user = getUserFromTempToken(request.getTempToken());

        if ("TOTP".equals(request.getMethod())) {
            if (!mfaService.verifyTotp(user, request.getCode())) {
                auditLogService.logAction(user.getUsername(), "MFA_VERIFY_FAILED", "Wrong code, method: TOTP");
                return ResponseEntity.badRequest().body(Map.of("message", "Cod invalid sau expirat"));
            }
        } else if ("EMAIL".equals(request.getMethod())) {
            if (!mfaService.verifyEmailOtp(user, request.getCode())) {
                auditLogService.logAction(user.getUsername(), "MFA_VERIFY_FAILED", "Wrong code, method: EMAIL");
                return ResponseEntity.badRequest().body(Map.of("message", "Cod invalid sau expirat"));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Metoda invalida"));
        }

        String finalToken = jwtService.generateToken(user);
        auditLogService.logAction(user.getUsername(), "USER_LOGIN", "User logged in via " + request.getMethod());
        return ResponseEntity.ok(new AuthResponse(finalToken, user.getUsername(), user.getRole(), false, true, null));
    }

    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailOtp(@RequestBody MfaEmailSendRequest request) {
        User user = getUserFromTempToken(request.getTempToken());
        mfaService.sendEmailOtp(user);
        return ResponseEntity.ok(Map.of("message", "Email sent"));
    }

    @PostMapping("/enable")
    public ResponseEntity<?> enableMfa(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            return ResponseEntity.badRequest().body(Map.of("message", "MFA is already enabled"));
        }
        
        String tempToken = jwtService.generateTempToken(user);
        return ResponseEntity.ok(Map.of("tempToken", tempToken));
    }
    
    @PostMapping("/disable")
    public ResponseEntity<?> disableMfa(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        mfaService.disableMfa(user);
        auditLogService.logAction(user.getUsername(), "MFA_DISABLED", "MFA disabled");
        return ResponseEntity.ok(Map.of("message", "MFA disabled successfully"));
    }
}
