package com.roommate.api.services;

import com.roommate.api.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.security.jwt-secret}") String secret,
            @Value("${app.security.jwt-expiration-seconds:86400}") long expirationSeconds) {
        if (secret.length() < 32) {
            throw new IllegalArgumentException("app.security.jwt-secret must be at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
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
            parse(token, claims -> claims.getExpiration());
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private <T> T parse(String token, Function<io.jsonwebtoken.Claims, T> extractor) {
        return extractor.apply(Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload());
    }
}
