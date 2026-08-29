package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.BookingRequest;
import com.example.IRON.dto.response.BookingResponse;
import com.example.IRON.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
    BookingResponse create(Long userId, BookingRequest request);
    Page<BookingResponse> getMyBookings(Long userId, Pageable pageable);
    Page<BookingResponse> getAllBookings(Booking.BookingStatus status, Pageable pageable);
    BookingResponse updateStatus(Long id, Booking.BookingStatus status);
    void cancel(Long id, Long userId);
    BookingResponse toResponse(Booking booking);
}