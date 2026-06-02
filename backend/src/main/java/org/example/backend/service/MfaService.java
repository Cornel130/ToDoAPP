package org.example.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.example.backend.entity.EmailOtpToken;
import org.example.backend.entity.User;
import org.example.backend.repo.EmailOtpTokenRepository;
import org.example.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MfaService {

    private final UserRepository userRepository;
    private final EmailOtpTokenRepository emailOtpTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final GoogleAuthenticator gAuth;

    @Value("${app.mfa.issuer:ToDoApp}")
    private String mfaIssuer;

    @Value("${app.mfa.otp-expiry-minutes:10}")
    private long otpExpiryMinutes;

    public MfaService(UserRepository userRepository,
                      EmailOtpTokenRepository emailOtpTokenRepository,
                      EmailService emailService,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailOtpTokenRepository = emailOtpTokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.gAuth = new GoogleAuthenticator();
    }

    public String generateAndSaveSecret(User user) {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        user.setMfaSecret(key.getKey());
        userRepository.save(user);
        return key.getKey();
    }

    public byte[] generateQrCodePng(User user) throws Exception {
        if (user.getMfaSecret() == null) {
            generateAndSaveSecret(user);
        }
        
        String otpAuthUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                mfaIssuer, user.getEmail(), user.getMfaSecret(), mfaIssuer);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(otpAuthUrl, BarcodeFormat.QR_CODE, 200, 200);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    public boolean verifyTotp(User user, String code) {
        if (user.getMfaSecret() == null) return false;
        try {
            int codeInt = Integer.parseInt(code);
            return gAuth.authorize(user.getMfaSecret(), codeInt);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public void enableMfa(User user) {
        user.setMfaEnabled(true);
        userRepository.save(user);
    }

    public void disableMfa(User user) {
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
    }

    public void sendEmailOtp(User user) {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        String codeStr = String.valueOf(code);

        emailOtpTokenRepository.deleteAllByUser(user);

        EmailOtpToken token = new EmailOtpToken();
        token.setUser(user);
        token.setCodeHash(passwordEncoder.encode(codeStr));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        token.setUsed(false);
        emailOtpTokenRepository.save(token);

        String subject = "Your ToDoApp Verification Code";
        String text = "Your verification code is: " + codeStr + "\nThis code will expire in " + otpExpiryMinutes + " minutes.";
        emailService.sendEmail(user.getEmail(), subject, text);
    }

    public boolean verifyEmailOtp(User user, String code) {
        Optional<EmailOtpToken> tokenOpt = emailOtpTokenRepository.findTopByUserAndUsedFalseOrderByExpiresAtDesc(user);
        
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        EmailOtpToken token = tokenOpt.get();
        
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        if (passwordEncoder.matches(code, token.getCodeHash())) {
            token.setUsed(true);
            emailOtpTokenRepository.save(token);
            return true;
        }
        
        return false;
    }
}
