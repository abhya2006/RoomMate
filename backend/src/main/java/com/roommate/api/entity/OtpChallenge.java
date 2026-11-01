package com.roommate.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.function.Function;

@Entity
@Table(name = "otp_challenges")
public class OtpChallenge {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String purpose;

    @Column(name = "email_otp_hash", nullable = false, length = 64)
    private String emailOtpHash;

    @Column(name = "phone_otp_hash", nullable = false, length = 64)
    private String phoneOtpHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    protected OtpChallenge() {
    }

    public OtpChallenge(String id, User user, String purpose, String emailOtpHash,
            String phoneOtpHash, Instant expiresAt) {
        this.id = id;
        this.user = user;
        this.purpose = purpose;
        this.emailOtpHash = emailOtpHash;
        this.phoneOtpHash = phoneOtpHash;
        this.expiresAt = expiresAt;
    }

    public String getId() { return id; }
    public User getUser() { return user; }
    public String getPurpose() { return purpose; }

    public boolean isUsableAt(Instant now) {
        return verifiedAt == null && expiresAt.isAfter(now) && attempts < 5;
    }

    public boolean matches(String emailOtp, String phoneOtp,
            Function<String, String> emailHash, Function<String, String> phoneHash) {
        return emailOtpHash.equals(emailHash.apply(emailOtp))
                && phoneOtpHash.equals(phoneHash.apply(phoneOtp));
    }

    public void incrementAttempts() { attempts++; }
    public void markVerified(Instant now) { verifiedAt = now; }
}
