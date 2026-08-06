package com.example.IRON.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "motorcycle_images")
public class MotorcycleImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", nullable = false)
    private Motorcycle motorcycle;

    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(name = "color_name", length = 50)
    private String colorName;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    public MotorcycleImage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Motorcycle getMotorcycle() { return motorcycle; }
    public void setMotorcycle(Motorcycle motorcycle) { this.motorcycle = motorcycle; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getColorName() { return colorName; }
    public void setColorName(String colorName) { this.colorName = colorName; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
}
