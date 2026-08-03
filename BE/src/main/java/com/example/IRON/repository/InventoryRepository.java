package com.example.IRON.repository;

import com.example.IRON.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByMotorcycleId(Long motorcycleId);
    Optional<Inventory> findByMotorcycleIdAndColorName(Long motorcycleId, String colorName);
}