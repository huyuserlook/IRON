package com.example.IRON.repository;

import com.example.IRON.entity.Deposit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, Long> {
    Page<Deposit> findByUserId(Long userId, Pageable pageable);
    Optional<Deposit> findByOrderId(Long orderId);
    Page<Deposit> findByStatus(Deposit.DepositStatus status, Pageable pageable);
    List<Deposit> findByDeadlineDateBeforeAndStatus(LocalDateTime deadline, Deposit.DepositStatus status);
    boolean existsByUserIdAndOrderId(Long userId, Long orderId);
}
