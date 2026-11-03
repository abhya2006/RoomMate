package com.roommate.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.roommate.api.dto.BookingDtos.CreateBookingRequest;
import com.roommate.api.entity.RoomListing;
import com.roommate.api.entity.User;
import com.roommate.api.repository.BookingRepository;
import com.roommate.api.repository.RoomListingRepository;
import com.roommate.api.repository.UserRepository;
import com.roommate.api.services.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;

class BookingServiceTest {
    private final BookingRepository bookings = mock(BookingRepository.class);
    private final RoomListingRepository rooms = mock(RoomListingRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final BookingService service = new BookingService(bookings, rooms, users, mock(PasswordEncoder.class));

    @Test
    void rejectsDraftListings() {
        RoomListing room = mock(RoomListing.class);
        when(bookings.lockRoomById(7L)).thenReturn(Optional.of(room));
        when(room.getStatus()).thenReturn("DRAFT");

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.create("renter", new CreateBookingRequest(7L)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(users, never()).findByUsernameIgnoreCase("renter");
    }

    @Test
    void rejectsFullyOccupiedListings() {
        RoomListing room = mock(RoomListing.class);
        User owner = mock(User.class);
        User renter = mock(User.class);
        when(bookings.lockRoomById(7L)).thenReturn(Optional.of(room));
        when(room.getStatus()).thenReturn("ACTIVE");
        when(room.getOwner()).thenReturn(owner);
        when(owner.getId()).thenReturn(1L);
        when(renter.getId()).thenReturn(2L);
        when(users.findByUsernameIgnoreCase("renter")).thenReturn(Optional.of(renter));
        when(room.getId()).thenReturn(7L);
        when(room.getCapacity()).thenReturn(2);
        when(room.getOccupancy()).thenReturn(1);
        when(bookings.countByRoomIdAndStatusIn(7L, java.util.List.of("REQUESTED", "CONFIRMED")))
                .thenReturn(1L);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.create("renter", new CreateBookingRequest(7L)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(bookings, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
