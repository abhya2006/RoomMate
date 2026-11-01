package com.roommate.api.controllers;

import java.time.Instant;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final HealthEndpoint healthEndpoint;

    public HealthController(HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    @GetMapping
    public HealthResponse health() {
        HealthComponent health = healthEndpoint.health();
        return new HealthResponse("roommate-api", health.getStatus().getCode(), Instant.now());
    }

    public record HealthResponse(String service, String status, Instant timestamp) {
    }
}
