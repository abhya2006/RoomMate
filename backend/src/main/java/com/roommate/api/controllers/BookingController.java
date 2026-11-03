package com.roommate.api.controllers;

import com.roommate.api.dto.BookingDtos.BookingResponse;
import com.roommate.api.dto.BookingDtos.ConfirmBookingRequest;
import com.roommate.api.dto.BookingDtos.CreateBookingRequest;
import com.roommate.api.dto.BookingDtos.ArriveBookingRequest;
import com.roommate.api.services.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {
    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateBookingRequest request) {
        return service.create(principal.getUsername(), request);
    }

    @GetMapping("/mine")
    public List<BookingResponse> mine(@AuthenticationPrincipal UserDetails principal) {
        return service.mine(principal.getUsername());
    }

    @GetMapping("/owner")
    public List<BookingResponse> owner(@AuthenticationPrincipal UserDetails principal) {
        return service.forOwner(principal.getUsername());
    }

    @PostMapping("/{id}/arrive")
    public BookingResponse arrive(@AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id, @Valid @RequestBody ArriveBookingRequest request) {
        return service.arrive(principal.getUsername(), id, request.latitude(), request.longitude());
    }

    @PostMapping("/{id}/confirm")
    public BookingResponse confirm(@AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id, @RequestBody ConfirmBookingRequest request) {
        return service.confirm(principal.getUsername(), id, request.otp());
    }
}
