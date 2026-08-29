package com.example.IRON.repository;

import com.example.IRON.entity.Installment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Long> {
    Page<Installment> findByUserId(Long userId, Pageable pageable);
    Page<Installment> findByStatus(Installment.Status status, Pageable pageable);
}
