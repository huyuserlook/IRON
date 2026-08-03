package com.example.IRON.repository;

import com.example.IRON.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findBySlug(String slug);
    Optional<Brand> findByName(String name);
    boolean existsByName(String name);
    List<Brand> findByActiveTrue();
}