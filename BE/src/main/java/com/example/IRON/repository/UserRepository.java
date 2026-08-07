package com.example.IRON.repository;

import com.example.IRON.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countNewUsers(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u WHERE u.createdAt >= :since ORDER BY u.createdAt DESC")
    List<User> findNewUsers(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.resetToken IS NOT NULL AND u.resetTokenApproved = false AND u.passwordResetRequestedAt >= :since AND u.deleted = false")
    long countPendingPasswordResetRequests(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u WHERE u.resetToken IS NOT NULL AND u.resetTokenApproved = false AND u.passwordResetRequestedAt >= :since AND u.deleted = false ORDER BY u.passwordResetRequestedAt DESC")
    List<User> findPendingPasswordResetRequestsSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deleted = false")
    Page<User> findByDeletedFalse(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.resetToken IS NOT NULL AND u.resetTokenApproved = false AND u.deleted = false ORDER BY u.passwordResetRequestedAt DESC")
    Page<User> findPendingPasswordResetRequests(Pageable pageable);
}
