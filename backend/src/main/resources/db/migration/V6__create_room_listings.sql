CREATE TABLE room_listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    occupancy INT NOT NULL DEFAULT 0,
    privacy VARCHAR(20) NOT NULL,
    stay_type VARCHAR(30) NOT NULL,
    rent DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    image_url LONGTEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_listings_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT chk_room_capacity CHECK (capacity > 0),
    CONSTRAINT chk_room_occupancy CHECK (occupancy >= 0 AND occupancy <= capacity),
    CONSTRAINT chk_room_rent CHECK (rent >= 0)
);

CREATE INDEX idx_room_listings_owner ON room_listings(owner_id);
CREATE INDEX idx_room_listings_status ON room_listings(status);
