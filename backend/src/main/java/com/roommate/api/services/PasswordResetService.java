package com.roommate.api.services;

import com.roommate.api.dto.PasswordResetDtos.ForgotPasswordRequest;
import com.roommate.api.dto.PasswordResetDtos.ResetPasswordRequest;
import com.roommate.api.dto.OtpDtos.ChallengeResponse;
import com.roommate.api.entity.PasswordResetToken;
import com.roommate.api.entity.User;
import com.roommate.api.repository.PasswordResetTokenRepository;
import com.roommate.api.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final String resetUrl;
    private final long expirationMinutes;
    private final OtpService otpService;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            OtpService otpService,
            @Value("${app.password-reset.url}") String resetUrl,
            @Value("${app.password-reset.expiration-minutes:15}") long expirationMinutes) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.otpService = otpService;
        this.resetUrl = resetUrl;
        this.expirationMinutes = expirationMinutes;
    }

    @Transactional
    public ChallengeResponse requestOtp(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(email, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "No account exists for this email"));
        return otpService.issue(user, "FORGOT_PASSWORD");
    }

    @Transactional
    public void requestReset(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(email, email)
                .orElse(null);
        if (user == null) {
            return;
        }

        String rawToken = generateToken();
        tokenRepository.deleteByUserId(user.getId());
        tokenRepository.save(new PasswordResetToken(
                user,
                hash(rawToken),
                Instant.now().plusSeconds(expirationMinutes * 60)));
        sendResetEmail(user.getEmail(), rawToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(hash(request.token()))
                .filter(token -> token.isUsableAt(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Reset token is invalid or expired"));
        resetToken.getUser().setPasswordHash(passwordEncoder.encode(request.newPassword()));
        resetToken.markUsed(Instant.now());
        userRepository.save(resetToken.getUser());
    }

    private void sendResetEmail(String email, String rawToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Reset your RoomMate password");
            message.setText("Reset your password using this link (valid for "
                    + expirationMinutes + " minutes): " + resetUrl + "?token=" + rawToken);
            mailSender.send(message);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Password reset email service is not configured",
                    exception);
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(64);
            for (byte item : digest) {
                result.append(String.format("%02x", item));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
