package com.example.IRON.repository;

import com.example.IRON.entity.RoleChangeLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleChangeLogRepository extends JpaRepository<RoleChangeLog, Long> {
    Page<RoleChangeLog> findByTargetUserId(Long targetUserId, Pageable pageable);
    Page<RoleChangeLog> findByActorUserId(Long actorUserId, Pageable pageable);
}
