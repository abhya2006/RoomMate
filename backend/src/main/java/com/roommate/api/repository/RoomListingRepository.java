package com.roommate.api.repository;

import com.roommate.api.entity.RoomListing;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomListingRepository extends JpaRepository<RoomListing, Long> {
    List<RoomListing> findByOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
    List<RoomListing> findByStatusAndLatitudeIsNotNullAndLongitudeIsNotNull(String status);
}
