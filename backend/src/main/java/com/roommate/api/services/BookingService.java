package com.roommate.api.services;

import com.roommate.api.dto.BookingDtos.BookingResponse;
import com.roommate.api.dto.BookingDtos.CreateBookingRequest;
import com.roommate.api.entity.Booking;
import com.roommate.api.repository.BookingRepository;
import com.roommate.api.repository.RoomListingRepository;
import com.roommate.api.repository.UserRepository;
import java.security.SecureRandom;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final BookingOtpCipher otpCipher;
    private final SecureRandom random = new SecureRandom();

    @Autowired
    public BookingService(BookingRepository bookingRepository, RoomListingRepository roomRepository,
            UserRepository userRepository, PasswordEncoder passwordEncoder, BookingOtpCipher otpCipher) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpCipher = otpCipher;
    }

    /** Keeps direct construction in existing service tests independent of Spring wiring. */
    @Deprecated(forRemoval = false)
    public BookingService(BookingRepository bookingRepository, RoomListingRepository roomRepository,
            UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this(bookingRepository, roomRepository, userRepository, passwordEncoder,
                new BookingOtpCipher("test-only-booking-secret"));
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
        var booking = bookingRepository.save(new Booking(room, renter,
                passwordEncoder.encode(otp), otpCipher.encrypt(otp)));
        return BookingResponse.from(booking, null);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> mine(String username) {
        return bookingRepository.findByRenterUsernameIgnoreCaseOrderByCreatedAtDesc(username)
                .stream().map(booking -> BookingResponse.from(booking, otpAfterArrival(booking))).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> forOwner(String username) {
        return bookingRepository.findByRoomOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(username)
                .stream().map(booking -> BookingResponse.from(booking, null)).toList();
    }

    @Transactional
    public BookingResponse arrive(String username, Long bookingId, double latitude, double longitude) {
        var booking = bookingRepository.findByIdAndRenterUsernameIgnoreCase(bookingId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This booking is no longer active");
        }
        if (booking.getOtpEncrypted() == null || booking.getOtpEncrypted().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This older booking has no saved OTP. Create a new booking request to get an arrival OTP.");
        }
        if (booking.getRenterArrivedAt() == null) {
            var room = booking.getRoom();
            if (room.getLatitude() == null || room.getLongitude() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This room does not have a verified GPS location");
            }
            if (distanceKm(latitude, longitude, room.getLatitude(), room.getLongitude()) > 0.5) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Move within 500 metres of the room to reveal the booking OTP");
            }
            booking.markRenterArrived();
            booking = bookingRepository.save(booking);
        }
        return BookingResponse.from(booking, otpCipher.decrypt(booking.getOtpEncrypted()));
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
        if (booking.getRenterArrivedAt() == null && booking.getOtpEncrypted() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "The renter must arrive at the room before the OTP can confirm this booking");
        }
        if (!passwordEncoder.matches(otp, booking.getOtpHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect booking OTP");
        }
        booking.confirm();
        return BookingResponse.from(bookingRepository.save(booking), null);
    }

    private String otpAfterArrival(com.roommate.api.entity.Booking booking) {
        if (booking.getRenterArrivedAt() == null || booking.getOtpEncrypted() == null
                || "CANCELLED".equals(booking.getStatus())) return null;
        return otpCipher.decrypt(booking.getOtpEncrypted());
    }

    private static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double lat = Math.toRadians(lat2 - lat1);
        double lon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(lat / 2) * Math.sin(lat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lon / 2) * Math.sin(lon / 2);
        return 6371.0 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
