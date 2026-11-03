package com.roommate.api.dto;

import com.roommate.api.entity.Booking;
import java.math.BigDecimal;
import java.time.Instant;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

public final class BookingDtos {
    private BookingDtos() {}

    public record CreateBookingRequest(@NotNull @Positive Long roomId) {}
    public record ConfirmBookingRequest(String otp) {}
    public record ArriveBookingRequest(
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude) {}

    public record BookingResponse(
            Long id, Long roomId, String roomTitle, String location, BigDecimal rent,
            String status, String bookingOtp, Instant createdAt, Instant confirmedAt, Instant renterArrivedAt,
            String renterFullName, String renterPhoneNumber,
            String ownerFullName, String ownerPhoneNumber,
            Double latitude, Double longitude) {
        public static BookingResponse from(Booking booking, String otp) {
            var room = booking.getRoom();
            var owner = room.getOwner();
            var renter = booking.getRenter();
            return new BookingResponse(booking.getId(), room.getId(), room.getTitle(),
                    room.getLocation(), room.getRent(), booking.getStatus(), otp,
                    booking.getCreatedAt(), booking.getConfirmedAt(), booking.getRenterArrivedAt(), renter.getFullName(),
                    renter.getPhoneNumber(), owner.getFullName(), owner.getPhoneNumber(),
                    room.getLatitude(), room.getLongitude());
        }
    }
}
