package com.roommate.api;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.roommate.api.dto.OtpDtos.VerifyForgotPasswordRequest;
import com.roommate.api.dto.OtpDtos.VerifyOtpRequest;
import com.roommate.api.services.OtpService;
import com.roommate.api.entity.OtpChallenge;
import com.roommate.api.repository.OtpChallengeRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

class OtpServiceTest {
    @Test
    void wrongOtpCountsAttemptBeforeReturningError() {
        OtpChallengeRepository repository = mock(OtpChallengeRepository.class);
        OtpChallenge challenge = mock(OtpChallenge.class);
        when(repository.findByIdAndPurpose("challenge", "REGISTRATION")).thenReturn(Optional.of(challenge));
        when(challenge.isUsableAt(any(Instant.class))).thenReturn(true);
        when(challenge.matches(eq("111111"), eq("222222"), any(), any())).thenReturn(false);
        RestClient.Builder restClientBuilder = mock(RestClient.Builder.class);
        when(restClientBuilder.baseUrl("https://control.msg91.com")).thenReturn(restClientBuilder);
        when(restClientBuilder.build()).thenReturn(mock(RestClient.class));
        OtpService service = new OtpService(repository, mock(JavaMailSender.class), mock(PasswordEncoder.class),
                "", "", 300, "email", "", restClientBuilder);

        assertThrows(ResponseStatusException.class, () -> service.verify(
                new VerifyOtpRequest("challenge", "111111", "222222"), "REGISTRATION"));
        verify(challenge).incrementAttempts();
    }

    @Test
    void failedOtpAttemptsAreCommittedForBothVerificationFlows() throws Exception {
        assertNoRollbackForOtpFailure(OtpService.class.getMethod("verify", VerifyOtpRequest.class, String.class));
        assertNoRollbackForOtpFailure(OtpService.class.getMethod("verifyForgotPassword", VerifyForgotPasswordRequest.class));
    }

    private static void assertNoRollbackForOtpFailure(java.lang.reflect.Method method) {
        Transactional transaction = method.getAnnotation(Transactional.class);
        assertTrue(java.util.Arrays.asList(transaction.noRollbackFor()).contains(ResponseStatusException.class));
    }
}
