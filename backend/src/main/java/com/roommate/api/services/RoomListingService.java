package com.roommate.api.services;

import com.roommate.api.dto.RoomListingDtos.CreateRoomRequest;
import com.roommate.api.dto.RoomListingDtos.RoomResponse;
import com.roommate.api.entity.RoomListing;
import com.roommate.api.entity.User;
import com.roommate.api.repository.RoomListingRepository;
import com.roommate.api.repository.UserRepository;
import java.util.List;
import java.util.Comparator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RoomListingService {
    private final RoomListingRepository roomRepository;
    private final UserRepository userRepository;

    public RoomListingService(RoomListingRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RoomResponse create(String username, CreateRoomRequest request) {
        if (request.occupancy() > request.capacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Current occupancy cannot exceed room capacity");
        }
        User owner = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        RoomListing room = new RoomListing(owner, request.title().trim(),
                request.location().trim(), request.capacity(), request.occupancy(),
                request.privacy().trim(), request.stayType().trim(), request.rent(),
                request.description().trim(), request.imageUrl());
        room.setCoordinates(request.latitude(), request.longitude());
        room = roomRepository.save(room);
        return RoomResponse.from(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> findMine(String username) {
        return roomRepository.findByOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(username)
                .stream().map(RoomResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> findNearby(double latitude, double longitude, String stayType, int limit) {
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid GPS coordinates");
        }
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return roomRepository.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull("ACTIVE").stream()
                .filter(room -> "ACTIVE".equals(room.getStatus()))
                .filter(room -> room.getLatitude() != null && room.getLongitude() != null)
                .filter(room -> room.getOccupancy() < room.getCapacity())
                .filter(room -> stayType == null || stayType.isBlank()
                        || room.getStayType().equalsIgnoreCase(stayType))
                .map(room -> new Nearby(room, distanceKm(latitude, longitude,
                        room.getLatitude(), room.getLongitude())))
                .sorted(Comparator.comparingDouble(Nearby::distanceKm))
                .limit(safeLimit)
                .map(item -> {
                    RoomResponse response = RoomResponse.from(item.room());
                    return new RoomResponse(response.id(), response.title(), response.location(),
                            response.capacity(), response.occupancy(), response.privacy(),
                            response.stayType(), response.rent(), response.description(),
                            response.imageUrl(), response.latitude(), response.longitude(),
                            item.distanceKm(), response.status(), response.createdAt(),
                            response.ownerUsername(), response.ownerFullName(), null);
                })
                .toList();
    }

    private static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double earthRadiusKm = 6371.0;
        double lat = Math.toRadians(lat2 - lat1);
        double lon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(lat / 2) * Math.sin(lat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lon / 2) * Math.sin(lon / 2);
        return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private record Nearby(RoomListing room, double distanceKm) {}
}
