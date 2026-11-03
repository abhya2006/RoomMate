package com.roommate.api.dto;

import com.roommate.api.entity.Booking;
import java.math.BigDecimal;
import java.time.Instant;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public final class BookingDtos {
    private BookingDtos() {}

    public record CreateBookingRequest(@NotNull @Positive Long roomId) {}
    public record ConfirmBookingRequest(String otp) {}

    public record BookingResponse(
            Long id, Long roomId, String roomTitle, String location, BigDecimal rent,
            String status, String bookingOtp, Instant createdAt, Instant confirmedAt,
            String renterFullName, String renterPhoneNumber,
            String ownerFullName, String ownerPhoneNumber,
            Double latitude, Double longitude) {
        public static BookingResponse from(Booking booking, String otp) {
            var room = booking.getRoom();
            var owner = room.getOwner();
            var renter = booking.getRenter();
            return new BookingResponse(booking.getId(), room.getId(), room.getTitle(),
                    room.getLocation(), room.getRent(), booking.getStatus(), otp,
                    booking.getCreatedAt(), booking.getConfirmedAt(), renter.getFullName(),
                    renter.getPhoneNumber(), owner.getFullName(), owner.getPhoneNumber(),
                    room.getLatitude(), room.getLongitude());
        }
    }
}
