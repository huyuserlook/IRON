package com.example.IRON.dto.response;

public class BrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
    private String description;
    private Boolean active;
    private long motorcycleCount;

    public BrandResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public long getMotorcycleCount() { return motorcycleCount; }
    public void setMotorcycleCount(long motorcycleCount) { this.motorcycleCount = motorcycleCount; }
}