package com.example.IRON.repository;

import com.example.IRON.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);
    boolean existsByUserIdAndMotorcycleIdAndBookingDate(
            Long userId, Long motorcycleId, LocalDate date);
}