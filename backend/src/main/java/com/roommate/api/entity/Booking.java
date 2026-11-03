package com.roommate.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private RoomListing room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    @Column(name = "otp_hash", nullable = false, length = 100)
    private String otpHash;

    @Column(nullable = false, length = 20)
    private String status = "REQUESTED";

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column
    private Instant confirmedAt;

    protected Booking() {}

    public Booking(RoomListing room, User renter, String otpHash) {
        this.room = room;
        this.renter = renter;
        this.otpHash = otpHash;
        this.createdAt = Instant.now();
    }

    public void confirm() {
        status = "CONFIRMED";
        confirmedAt = Instant.now();
    }

    public Long getId() { return id; }
    public RoomListing getRoom() { return room; }
    public User getRenter() { return renter; }
    public String getOtpHash() { return otpHash; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getConfirmedAt() { return confirmedAt; }
}
