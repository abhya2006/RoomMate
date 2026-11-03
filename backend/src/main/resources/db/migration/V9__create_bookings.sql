CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    renter_id BIGINT NOT NULL,
    otp_hash VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES room_listings(id),
    CONSTRAINT fk_bookings_renter FOREIGN KEY (renter_id) REFERENCES users(id),
    CONSTRAINT chk_bookings_status CHECK (status IN ('REQUESTED', 'CONFIRMED', 'CANCELLED'))
);

CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
