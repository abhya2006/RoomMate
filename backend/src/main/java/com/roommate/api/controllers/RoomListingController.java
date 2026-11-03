package com.roommate.api.controllers;

import com.roommate.api.dto.RoomListingDtos.CreateRoomRequest;
import com.roommate.api.dto.RoomListingDtos.RoomResponse;
import com.roommate.api.services.RoomListingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomListingController {
    private final RoomListingService service;

    public RoomListingController(RoomListingService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse create(@AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateRoomRequest request) {
        return service.create(principal.getUsername(), request);
    }

    @GetMapping("/mine")
    public List<RoomResponse> mine(@AuthenticationPrincipal UserDetails principal) {
        return service.findMine(principal.getUsername());
    }

    @GetMapping("/nearby")
    public List<RoomResponse> nearby(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String stayType,
            @RequestParam(defaultValue = "20") int limit) {
        return service.findNearby(latitude, longitude, stayType, limit);
    }
}
