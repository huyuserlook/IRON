package com.example.IRON.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", nullable = false)
    private Motorcycle motorcycle;

    @Column(name = "color_name", length = 50)
    private String colorName;

    @Column(name = "color_code", length = 20)
    private String colorCode;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public Inventory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Motorcycle getMotorcycle() { return motorcycle; }
    public void setMotorcycle(Motorcycle motorcycle) { this.motorcycle = motorcycle; }
    public String getColorName() { return colorName; }
    public void setColorName(String colorName) { this.colorName = colorName; }
    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}