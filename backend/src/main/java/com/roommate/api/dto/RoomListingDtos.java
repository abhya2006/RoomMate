package com.roommate.api.dto;

import com.roommate.api.entity.RoomListing;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

public final class RoomListingDtos {
    private RoomListingDtos() {}

    public record CreateRoomRequest(
            @NotBlank @Size(max = 160) String title,
            @NotBlank @Size(max = 255) String location,
            @Min(1) int capacity,
            @Min(0) int occupancy,
            @NotBlank @Size(max = 20) String privacy,
            @NotBlank @Size(max = 30) String stayType,
            @NotNull @DecimalMin(value = "0.01") BigDecimal rent,
            @NotBlank String description,
            @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 2_000_000) String imageUrl) {}

    public record RoomResponse(
            Long id, String title, String location, int capacity, int occupancy,
            String privacy, String stayType, BigDecimal rent, String description,
            String imageUrl, Double latitude, Double longitude, Double distanceKm,
            String status, Instant createdAt, String ownerUsername, String ownerFullName,
            String ownerPhoneNumber) {
        public static RoomResponse from(RoomListing room) {
            return new RoomResponse(room.getId(), room.getTitle(), room.getLocation(),
                    room.getCapacity(), room.getOccupancy(), room.getPrivacy(), room.getStayType(),
                    room.getRent(), room.getDescription(), room.getImageUrl(), room.getLatitude(),
                    room.getLongitude(), null, room.getStatus(),
                    room.getCreatedAt(), room.getOwner().getUsername(),
                    room.getOwner().getFullName(), room.getOwner().getPhoneNumber());
        }
    }
}
