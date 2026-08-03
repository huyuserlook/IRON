package com.example.IRON.service.impl;

import com.example.IRON.entity.Inventory;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.InventoryRepository;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.service.interfaces.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MotorcycleRepository motorcycleRepository;

    @Override
    public List<Inventory> getByMotorcycleId(Long motorcycleId) {
        return inventoryRepository.findByMotorcycleId(motorcycleId);
    }

    @Override
    @Transactional
    public void updateQuantity(Long motorcycleId, String colorName, int delta) {
        Inventory inventory = inventoryRepository.findByMotorcycleIdAndColorName(motorcycleId, colorName)
                .orElseGet(() -> {
                    Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                            .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "id", motorcycleId));
                    Inventory newInv = new Inventory();
                    newInv.setMotorcycle(motorcycle);
                    newInv.setColorName(colorName);
                    newInv.setQuantity(0);
                    return newInv;
                });
        
        int newQty = inventory.getQuantity() + delta;
        if (newQty < 0) throw new RuntimeException("Số lượng tồn kho không đủ cho xe: " + inventory.getMotorcycle().getName());
        inventory.setQuantity(newQty);
        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void setQuantity(Long motorcycleId, String colorName, int quantity) {
        Inventory inventory = inventoryRepository.findByMotorcycleIdAndColorName(motorcycleId, colorName)
                .orElseGet(() -> {
                    Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                            .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "id", motorcycleId));
                    Inventory newInv = new Inventory();
                    newInv.setMotorcycle(motorcycle);
                    newInv.setColorName(colorName);
                    return newInv;
                });
        inventory.setQuantity(quantity);
        inventoryRepository.save(inventory);
    }
}
