package com.roommate.api;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

import com.roommate.api.entity.RevokedToken;
import com.roommate.api.entity.User;
import com.roommate.api.repository.RevokedTokenRepository;
import com.roommate.api.services.JwtService;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
    @Test
    void revokedTokenCannotBeValidatedAgain() {
        RevokedTokenRepository repository = org.mockito.Mockito.mock(RevokedTokenRepository.class);
        AtomicBoolean revoked = new AtomicBoolean(false);
        when(repository.existsByTokenHashAndExpiresAtAfter(anyString(), any(Instant.class)))
                .thenAnswer(invocation -> revoked.get());
        doAnswer(invocation -> { revoked.set(true); return invocation.getArgument(0); })
                .when(repository).save(any(RevokedToken.class));
        JwtService service = new JwtService("test-secret-long-enough-for-hmac-signing-key-123", 3600, repository);
        User user = new User("tester", "tester@example.com", "hash", "Test User", "9876543210", "a".repeat(64), "1234");
        String token = service.createToken(user);

        assertTrue(service.isValid(token));
        service.revoke(token);
        assertFalse(service.isValid(token));
    }
}
