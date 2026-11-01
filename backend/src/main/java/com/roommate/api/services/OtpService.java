package com.roommate.api.services;

import com.roommate.api.dto.OtpDtos.ChallengeResponse;
import com.roommate.api.dto.OtpDtos.VerifyForgotPasswordRequest;
import com.roommate.api.dto.OtpDtos.VerifyOtpRequest;
import com.roommate.api.entity.OtpChallenge;
import com.roommate.api.entity.User;
import com.roommate.api.repository.OtpChallengeRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.client.RestClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OtpService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final OtpChallengeRepository repository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final String msg91AuthKey;
    private final String msg91TemplateId;
    private final long expirySeconds;
    private final RestClient restClient;

    public OtpService(OtpChallengeRepository repository, JavaMailSender mailSender,
            PasswordEncoder passwordEncoder,
            @Value("${app.msg91.auth-key:}") String msg91AuthKey,
            @Value("${app.msg91.template-id:}") String msg91TemplateId,
            @Value("${app.otp.expiry-seconds:300}") long expirySeconds,
            RestClient.Builder restClientBuilder) {
        this.repository = repository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
        this.msg91AuthKey = msg91AuthKey;
        this.msg91TemplateId = msg91TemplateId;
        this.expirySeconds = expirySeconds;
        this.restClient = restClientBuilder.baseUrl("https://control.msg91.com").build();
    }

    @Transactional
    public ChallengeResponse issue(User user, String purpose) {
        String emailOtp = otp();
        String phoneOtp = otp();
        String id = UUID.randomUUID().toString();
        repository.save(new OtpChallenge(id, user, purpose, hash(emailOtp), hash(phoneOtp),
                Instant.now().plusSeconds(expirySeconds)));
        sendEmail(user.getEmail(), emailOtp);
        sendSms(user.getPhoneNumber(), phoneOtp);
        return new ChallengeResponse(id, expirySeconds);
    }

    @Transactional
    public User verify(VerifyOtpRequest request, String purpose) {
        OtpChallenge challenge = findUsable(request.challengeId(), purpose);
        challenge.incrementAttempts();
        if (!challenge.matches(request.emailOtp(), request.phoneOtp(), this::hash, this::hash)) {
            throw invalidOtp();
        }
        challenge.markVerified(Instant.now());
        challenge.getUser().markEmailVerified();
        challenge.getUser().markPhoneVerified();
        return challenge.getUser();
    }

    @Transactional
    public User verifyForgotPassword(VerifyForgotPasswordRequest request) {
        User user = verify(new VerifyOtpRequest(request.challengeId(), request.emailOtp(), request.phoneOtp()),
                "FORGOT_PASSWORD");
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        return user;
    }

    private OtpChallenge findUsable(String id, String purpose) {
        return repository.findByIdAndPurpose(id, purpose)
                .filter(challenge -> challenge.isUsableAt(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "OTP challenge is invalid or expired"));
    }

    private void sendEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your RoomMate verification OTP");
            message.setText("Your OTP is " + otp + ". It expires in 5 minutes.");
            mailSender.send(message);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email OTP service is not configured", exception);
        }
    }

    private void sendSms(String phone, String otp) {
        if (msg91AuthKey.isBlank() || msg91TemplateId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "MSG91 OTP service is not configured");
        }
        try {
            restClient.post()
                    .uri("/api/v5/otp")
                    .header("authkey", msg91AuthKey)
                    .body(java.util.Map.of(
                            "template_id", msg91TemplateId,
                            "mobile", "91" + phone,
                            "otp", otp))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "SMS OTP delivery failed", exception);
        }
    }

    private String otp() { return String.format("%06d", RANDOM.nextInt(1_000_000)); }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private ResponseStatusException invalidOtp() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
    }
}
