package com.roommate.api.repository;

import com.roommate.api.entity.OtpChallenge;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, String> {
    Optional<OtpChallenge> findByIdAndPurpose(String id, String purpose);

    boolean existsByUser_IdAndPurposeAndExpiresAtAfter(Long userId, String purpose, Instant expiresAt);
}
