package com.example.IRON.dto.response;

public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Boolean active;
    private long motorcycleCount;

    public CategoryResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public long getMotorcycleCount() { return motorcycleCount; }
    public void setMotorcycleCount(long motorcycleCount) { this.motorcycleCount = motorcycleCount; }
}