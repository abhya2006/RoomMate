package com.roommate.api.controllers;

import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth/digilocker")
public class DigiLockerController {

    private final String authorizationUrl;
    private final String clientId;

    public DigiLockerController(
            @Value("${app.digilocker.authorization-url:}") String authorizationUrl,
            @Value("${app.digilocker.client-id:}") String clientId) {
        this.authorizationUrl = authorizationUrl;
        this.clientId = clientId;
    }

    @PostMapping("/start")
    public DigiLockerStartResponse start() {
        if (authorizationUrl.isBlank() || clientId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "DigiLocker partner credentials are not configured");
        }
        return new DigiLockerStartResponse(
                URI.create(authorizationUrl + "?client_id=" + clientId),
                "PENDING");
    }

    public record DigiLockerStartResponse(URI authorizationUrl, String status) {
    }
}
