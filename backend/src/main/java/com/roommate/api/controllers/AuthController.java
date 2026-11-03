package com.roommate.api.controllers;

import com.roommate.api.dto.AuthDtos;
import com.roommate.api.dto.AuthDtos.AuthResponse;
import com.roommate.api.dto.AuthDtos.LoginRequest;
import com.roommate.api.dto.AuthDtos.RegisterRequest;
import com.roommate.api.dto.PasswordResetDtos.ForgotPasswordRequest;
import com.roommate.api.dto.PasswordResetDtos.ResetPasswordRequest;
import com.roommate.api.dto.OtpDtos.ChallengeResponse;
import com.roommate.api.dto.OtpDtos.VerifyForgotPasswordRequest;
import com.roommate.api.dto.OtpDtos.VerifyOtpRequest;
import com.roommate.api.dto.OtpDtos.ResendOtpRequest;
import com.roommate.api.services.AuthService;
import com.roommate.api.services.PasswordResetService;
import com.roommate.api.services.OtpService;
import com.roommate.api.services.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final OtpService otpService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService,
            OtpService otpService, JwtService jwtService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ChallengeResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register/verify-otp")
    public AuthResponse verifyRegistration(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyRegistration(request);
    }

    @PostMapping("/register/resend-otp")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ChallengeResponse resendRegistrationOtp(@Valid @RequestBody ResendOtpRequest request) {
        return otpService.resendRegistrationOtp(request);
    }

    @GetMapping("/me")
    public AuthDtos.UserResponse me(@AuthenticationPrincipal UserDetails principal) {
        return authService.getUser(principal.getUsername());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader("Authorization") String authorization) {
        jwtService.revoke(authorization.substring("Bearer ".length()));
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ChallengeResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return passwordResetService.requestOtp(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
    }

    @PostMapping("/forgot-password/request-otp")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ChallengeResponse requestForgotPasswordOtp(
            @Valid @RequestBody com.roommate.api.dto.PasswordResetDtos.ForgotPasswordRequest request) {
        return passwordResetService.requestOtp(request);
    }

    @PostMapping("/forgot-password/verify-otp")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyForgotPasswordOtp(@Valid @RequestBody VerifyForgotPasswordRequest request) {
        otpService.verifyForgotPassword(request);
    }
}
