package com.roommate.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "room_listings")
public class RoomListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 160)
    private String title;
    @Column(nullable = false, length = 255)
    private String location;
    @Column(nullable = false)
    private int capacity;
    @Column(nullable = false)
    private int occupancy;
    @Column(nullable = false, length = 20)
    private String privacy;
    @Column(name = "stay_type", nullable = false, length = 30)
    private String stayType;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal rent;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;
    @Lob
    @Column(name = "image_urls", columnDefinition = "LONGTEXT")
    private String imageUrls;
    @Column
    private Double latitude;
    @Column
    private Double longitude;
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected RoomListing() {}

    public RoomListing(User owner, String title, String location, int capacity, int occupancy,
            String privacy, String stayType, BigDecimal rent, String description, String imageUrl) {
        this.owner = owner;
        this.title = title;
        this.location = location;
        this.capacity = capacity;
        this.occupancy = occupancy;
        this.privacy = privacy;
        this.stayType = stayType;
        this.rent = rent;
        this.description = description;
        this.imageUrl = imageUrl;
        this.createdAt = Instant.now();
    }

    public void setCoordinates(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getTitle() { return title; }
    public String getLocation() { return location; }
    public int getCapacity() { return capacity; }
    public int getOccupancy() { return occupancy; }
    public String getPrivacy() { return privacy; }
    public String getStayType() { return stayType; }
    public BigDecimal getRent() { return rent; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
