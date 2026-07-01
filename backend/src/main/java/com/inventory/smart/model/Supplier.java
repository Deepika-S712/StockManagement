package com.inventory.smart.model;

import jakarta.persistence.*;

@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    private Double rating;
    
    @Column(name = "delivery_time")
    private Integer deliveryTime;
    
    @Column(name = "price_level")
    private Double priceLevel;
    
    @Column(length = 100)
    private String contact;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(Integer deliveryTime) { this.deliveryTime = deliveryTime; }
    public Double getPriceLevel() { return priceLevel; }
    public void setPriceLevel(Double priceLevel) { this.priceLevel = priceLevel; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
}
