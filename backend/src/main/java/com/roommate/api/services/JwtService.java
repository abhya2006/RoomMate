package com.roommate.api.services;

import com.roommate.api.entity.User;
import com.roommate.api.entity.RevokedToken;
import com.roommate.api.repository.RevokedTokenRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationSeconds;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtService(
            @Value("${app.security.jwt-secret}") String secret,
            @Value("${app.security.jwt-expiration-seconds:86400}") long expirationSeconds,
            RevokedTokenRepository revokedTokenRepository) {
        if (secret.length() < 32) {
            throw new IllegalArgumentException("app.security.jwt-secret must be at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(signingKey)
                .compact();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    public String getUsername(String token) {
        return parse(token, claims -> claims.getSubject());
    }

    public boolean isValid(String token) {
        try {
            Date expiration = parse(token, claims -> claims.getExpiration());
            return !revokedTokenRepository.existsByTokenHashAndExpiresAtAfter(hash(token), Instant.now())
                    && expiration.after(new Date());
        } catch (RuntimeException exception) {
            return false;
        }
    }

    public void revoke(String token) {
        Date expiration = parse(token, claims -> claims.getExpiration());
        if (expiration.after(new Date())) {
            revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
            revokedTokenRepository.save(new RevokedToken(hash(token), expiration.toInstant()));
        }
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private <T> T parse(String token, Function<io.jsonwebtoken.Claims, T> extractor) {
        return extractor.apply(Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload());
    }
}
