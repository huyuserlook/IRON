package com.example.IRON.repository;

import com.example.IRON.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    Optional<PaymentMethod> findByCode(String code);
    Optional<PaymentMethod> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    java.util.List<PaymentMethod> findByActiveTrueOrderBySortOrderAsc();
}