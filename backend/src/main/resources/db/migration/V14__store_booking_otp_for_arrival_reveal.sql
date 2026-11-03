ALTER TABLE bookings
    ADD COLUMN otp_encrypted VARCHAR(255) NULL,
    ADD COLUMN renter_arrived_at TIMESTAMP NULL;
