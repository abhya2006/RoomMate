package com.roommate.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.roommate.api.entity.RoomListing;
import com.roommate.api.entity.User;
import com.roommate.api.repository.RoomListingRepository;
import com.roommate.api.repository.UserRepository;
import com.roommate.api.services.RoomListingService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class RoomListingServiceTest {
    @Test
    void nearbyReturnsOnlyAvailableActiveRoomsAndHidesOwnerPhone() {
        RoomListing openRoom = room("ACTIVE", 1, 2);
        RoomListing fullRoom = room("ACTIVE", 2, 2);
        RoomListing draftRoom = room("DRAFT", 0, 2);
        RoomListingRepository rooms = mock(RoomListingRepository.class);
        when(rooms.findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull("ACTIVE"))
                .thenReturn(List.of(openRoom, fullRoom, draftRoom));

        var results = new RoomListingService(rooms, mock(UserRepository.class))
                .findNearby(23.26, 77.41, null, 20);

        assertEquals(1, results.size());
        assertNull(results.getFirst().ownerPhoneNumber());
    }

    private static RoomListing room(String status, int occupancy, int capacity) {
        User owner = mock(User.class);
        when(owner.getUsername()).thenReturn("owner");
        when(owner.getFullName()).thenReturn("Owner Name");
        when(owner.getPhoneNumber()).thenReturn("9999999999");
        RoomListing room = mock(RoomListing.class);
        when(room.getId()).thenReturn(1L);
        when(room.getTitle()).thenReturn("Room");
        when(room.getLocation()).thenReturn("Bhopal");
        when(room.getCapacity()).thenReturn(capacity);
        when(room.getOccupancy()).thenReturn(occupancy);
        when(room.getPrivacy()).thenReturn("Private");
        when(room.getStayType()).thenReturn("Monthly");
        when(room.getRent()).thenReturn(new BigDecimal("5000.00"));
        when(room.getDescription()).thenReturn("Room description");
        when(room.getLatitude()).thenReturn(23.26);
        when(room.getLongitude()).thenReturn(77.41);
        when(room.getStatus()).thenReturn(status);
        when(room.getCreatedAt()).thenReturn(Instant.now());
        when(room.getOwner()).thenReturn(owner);
        return room;
    }
}
