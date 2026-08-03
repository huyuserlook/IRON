package com.example.IRON.service.interfaces;

import com.example.IRON.entity.Inventory;
import java.util.List;

public interface InventoryService {
    List<Inventory> getByMotorcycleId(Long motorcycleId);
    void updateQuantity(Long motorcycleId, String colorName, int delta);
    void setQuantity(Long motorcycleId, String colorName, int quantity);
}
