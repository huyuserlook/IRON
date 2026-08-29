package com.example.IRON.repository;

import com.example.IRON.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);
    boolean existsByUserIdAndMotorcycleIdAndBookingDate(
            Long userId, Long motorcycleId, LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :since")
    long countNewBookings(@Param("since") LocalDateTime since);

    @Query("SELECT b FROM Booking b WHERE b.createdAt >= :since ORDER BY b.createdAt DESC")
    List<Booking> findNewBookings(@Param("since") LocalDateTime since, Pageable pageable);
}
