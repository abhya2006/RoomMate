package com.roommate.api.repository;

import com.roommate.api.entity.Booking;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRenterUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
    List<Booking> findByRoomOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
    Optional<Booking> findByIdAndRenterUsernameIgnoreCase(Long id, String username);
    Optional<Booking> findByIdAndRoomOwnerUsernameIgnoreCase(Long id, String username);
    boolean existsByRoomIdAndRenterUsernameIgnoreCaseAndStatusIn(Long roomId, String username, List<String> statuses);
    long countByRoomIdAndStatusIn(Long roomId, List<String> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select room from RoomListing room where room.id = :id")
    Optional<com.roommate.api.entity.RoomListing> lockRoomById(@Param("id") Long id);
}
