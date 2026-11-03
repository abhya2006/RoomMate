package com.roommate.api;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import com.roommate.api.entity.OtpChallenge;
import com.roommate.api.entity.User;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class OtpChallengeTest {
    @Test
    void challengeStopsBeingUsableAfterFiveFailedAttempts() {
        User user = mock(User.class);
        OtpChallenge challenge = new OtpChallenge("id", user, "REGISTRATION", "email", "phone",
                Instant.now().plusSeconds(300));

        for (int attempt = 0; attempt < 4; attempt++) {
            assertTrue(challenge.isUsableAt(Instant.now()));
            challenge.incrementAttempts();
        }
        assertTrue(challenge.isUsableAt(Instant.now()));
        challenge.incrementAttempts();
        assertFalse(challenge.isUsableAt(Instant.now()));
    }
}
