package com.roommate.api.repository;

import com.roommate.api.entity.RevokedToken;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, String> {
    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    @Transactional
    long deleteByExpiresAtBefore(Instant now);
}
