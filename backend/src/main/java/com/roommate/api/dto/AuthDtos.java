package com.roommate.api.dto;

import com.roommate.api.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @NotBlank @jakarta.validation.constraints.Pattern(regexp = "^[6-9]\\d{9}$")
            String phoneNumber,
            @NotBlank @jakarta.validation.constraints.Pattern(regexp = "^\\d{12}$")
            String aadhaarNumber) {
    }

    public record LoginRequest(
            @NotBlank String identifier,
            @NotBlank @Size(min = 8, max = 72) String password) {
    }

    public record AuthResponse(
            String token,
            String tokenType,
            long expiresInSeconds,
            UserResponse user) {
    }

    public record UserResponse(
            Long id,
            String username,
            String email,
            String role,
            String fullName,
            String phoneNumber,
            String aadhaarLastFour,
            boolean emailVerified,
            boolean phoneVerified,
            boolean digilockerVerified) {

        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getFullName(),
                    user.getPhoneNumber(),
                    user.getAadhaarLastFour(),
                    user.isEmailVerified(),
                    user.isPhoneVerified(),
                    user.isDigilockerVerified());
        }
    }
}
