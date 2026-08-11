package com.example.IRON.repository;

import com.example.IRON.entity.DepositChangeLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepositChangeLogRepository extends JpaRepository<DepositChangeLog, Long> {
    Page<DepositChangeLog> findByDepositId(Long depositId, Pageable pageable);
}
