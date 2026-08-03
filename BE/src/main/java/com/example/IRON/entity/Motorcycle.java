package com.example.IRON.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "motorcycles")
public class Motorcycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(unique = true, length = 200)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "engine_cc")
    private Integer engineCc;

    @Column(name = "horsepower")
    private Double horsepower;

    @Column(name = "torque")
    private Double torque;

    @Column(name = "year_model")
    private Integer yearModel;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MotorcycleStatus status = MotorcycleStatus.AVAILABLE;

    @Column(nullable = false)
    private Boolean featured = false;

    @OneToMany(mappedBy = "motorcycle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MotorcycleImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "motorcycle", cascade = CascadeType.ALL)
    private List<Inventory> inventories = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); this.updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum MotorcycleStatus {
        AVAILABLE, OUT_OF_STOCK, DISCONTINUED, COMING_SOON
    }

    public Motorcycle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getEngineCc() { return engineCc; }
    public void setEngineCc(Integer engineCc) { this.engineCc = engineCc; }
    public Double getHorsepower() { return horsepower; }
    public void setHorsepower(Double horsepower) { this.horsepower = horsepower; }
    public Double getTorque() { return torque; }
    public void setTorque(Double torque) { this.torque = torque; }
    public Integer getYearModel() { return yearModel; }
    public void setYearModel(Integer yearModel) { this.yearModel = yearModel; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
    public MotorcycleStatus getStatus() { return status; }
    public void setStatus(MotorcycleStatus status) { this.status = status; }
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public List<MotorcycleImage> getImages() { return images; }
    public void setImages(List<MotorcycleImage> images) { this.images = images; }
    public List<Inventory> getInventories() { return inventories; }
    public void setInventories(List<Inventory> inventories) { this.inventories = inventories; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}