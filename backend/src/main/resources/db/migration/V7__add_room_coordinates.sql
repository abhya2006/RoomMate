ALTER TABLE room_listings
    ADD COLUMN latitude DECIMAL(9,6) NULL,
    ADD COLUMN longitude DECIMAL(9,6) NULL;

CREATE INDEX idx_room_listings_coordinates
    ON room_listings(latitude, longitude);
