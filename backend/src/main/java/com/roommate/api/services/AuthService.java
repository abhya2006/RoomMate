package com.roommate.api.services;

import com.roommate.api.dto.AuthDtos.AuthResponse;
import com.roommate.api.dto.AuthDtos.LoginRequest;
import com.roommate.api.dto.AuthDtos.RegisterRequest;
import com.roommate.api.dto.AuthDtos.UserResponse;
import com.roommate.api.entity.User;
import com.roommate.api.repository.UserRepository;
import java.util.Locale;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String aadhaarHashSecret;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.security.aadhaar-hash-secret}") String aadhaarHashSecret) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.aadhaarHashSecret = aadhaarHashSecret;
    }

    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String phoneNumber = request.phoneNumber().trim();
        String aadhaarHash = hashAadhaar(request.aadhaarNumber());
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already registered");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number is already registered");
        }
        if (userRepository.existsByAadhaarHash(aadhaarHash)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Aadhaar is already registered");
        }

        User user = userRepository.save(new User(
                username,
                email,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                phoneNumber,
                aadhaarHash,
                request.aadhaarNumber().substring(8)));
        return responseFor(user);
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return responseFor(user);
    }

    public UserResponse getUser(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.from(user);
    }

    private AuthResponse responseFor(User user) {
        return new AuthResponse(
                jwtService.createToken(user),
                "Bearer",
                jwtService.getExpirationSeconds(),
                UserResponse.from(user));
    }

    private String hashAadhaar(String aadhaarNumber) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest((aadhaarHashSecret + ":" + aadhaarNumber).getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(64);
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
