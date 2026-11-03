package com.roommate.api.services;

import com.roommate.api.dto.BookingDtos.BookingResponse;
import com.roommate.api.dto.BookingDtos.CreateBookingRequest;
import com.roommate.api.entity.Booking;
import com.roommate.api.repository.BookingRepository;
import com.roommate.api.repository.RoomListingRepository;
import com.roommate.api.repository.UserRepository;
import java.security.SecureRandom;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomListingRepository roomRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public BookingService(BookingRepository bookingRepository, RoomListingRepository roomRepository,
            UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public BookingResponse create(String username, CreateBookingRequest request) {
        var room = bookingRepository.lockRoomById(request.roomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        if (!"ACTIVE".equals(room.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This room is not available for booking");
        }
        var renter = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (room.getOwner().getId().equals(renter.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot book your own room");
        }
        long reservedSpots = bookingRepository.countByRoomIdAndStatusIn(
                room.getId(), List.of("REQUESTED", "CONFIRMED"));
        if (room.getOccupancy() + reservedSpots >= room.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This room has no available spots");
        }
        if (bookingRepository.existsByRoomIdAndRenterUsernameIgnoreCaseAndStatusIn(
                room.getId(), username, List.of("REQUESTED", "CONFIRMED"))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an active booking for this room");
        }
        String otp = String.format("%06d", random.nextInt(1_000_000));
        var booking = bookingRepository.save(new Booking(room, renter, passwordEncoder.encode(otp)));
        return BookingResponse.from(booking, otp);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> mine(String username) {
        return bookingRepository.findByRenterUsernameIgnoreCaseOrderByCreatedAtDesc(username)
                .stream().map(booking -> BookingResponse.from(booking, null)).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> forOwner(String username) {
        return bookingRepository.findByRoomOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(username)
                .stream().map(booking -> BookingResponse.from(booking, null)).toList();
    }

    @Transactional
    public BookingResponse confirm(String username, Long bookingId, String otp) {
        if (otp == null || !otp.matches("\\d{6}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter the 6-digit booking OTP");
        }
        var booking = bookingRepository.findByIdAndRoomOwnerUsernameIgnoreCase(bookingId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!"REQUESTED".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking is already processed");
        }
        if (!passwordEncoder.matches(otp, booking.getOtpHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect booking OTP");
        }
        booking.confirm();
        return BookingResponse.from(bookingRepository.save(booking), null);
    }
}
