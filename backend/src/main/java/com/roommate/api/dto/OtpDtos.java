package com.roommate.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class OtpDtos {
    private OtpDtos() {}

    public record ChallengeResponse(String challengeId, long expiresInSeconds) {}

    public record VerifyOtpRequest(
            @NotBlank String challengeId,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String emailOtp,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String phoneOtp) {}

    public record VerifyForgotPasswordRequest(
            @NotBlank String challengeId,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String emailOtp,
            @NotBlank @Pattern(regexp = "^\\d{6}$") String phoneOtp,
            @NotBlank @Size(min = 8, max = 72) String newPassword) {}
}
