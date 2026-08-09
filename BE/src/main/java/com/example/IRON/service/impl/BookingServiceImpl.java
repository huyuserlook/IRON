package com.example.IRON.service.impl;

import com.example.IRON.dto.request.BookingRequest;
import com.example.IRON.dto.response.BookingResponse;
import com.example.IRON.entity.*;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.exception.UnauthorizedException;
import com.example.IRON.repository.*;
import com.example.IRON.service.interfaces.BookingService;
import com.example.IRON.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public BookingResponse create(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Motorcycle motorcycle = motorcycleRepository.findById(request.getMotorcycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "id", request.getMotorcycleId()));

        if (bookingRepository.existsByUserIdAndMotorcycleIdAndBookingDate(
                userId, request.getMotorcycleId(), request.getBookingDate())) {
            throw new RuntimeException("Bạn đã đặt lịch lái thử xe này vào ngày đó rồi");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setMotorcycle(motorcycle);
        booking.setBookingDate(request.getBookingDate());
        booking.setBookingTime(request.getBookingTime());
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setNote(request.getNote());
        booking.setStatus(Booking.BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        String customerName = request.getCustomerName() != null ? request.getCustomerName() : user.getFullName();
        String bikeName = motorcycle != null ? motorcycle.getName() : "Xe";
        notificationService.createNotification(
                "BOOKING",
                "Lịch lái thử mới",
                customerName + " đặt lịch lái thử " + bikeName,
                "/admin/bookings",
                saved.getId()
        );

        return toResponse(saved);
    }

    @Override
    public Page<BookingResponse> getMyBookings(Long userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    public Page<BookingResponse> getAllBookings(Booking.BookingStatus status, Pageable pageable) {
        if (status != null) return bookingRepository.findByStatus(status, pageable).map(this::toResponse);
        return bookingRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public BookingResponse updateStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        booking.setStatus(status);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void cancel(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        if (!booking.getUser().getId().equals(userId))
            throw new UnauthorizedException("Không có quyền hủy lịch này");
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .motorcycleId(b.getMotorcycle().getId())
                .motorcycleName(b.getMotorcycle().getName())
                .motorcycleThumbnail(b.getMotorcycle().getThumbnailUrl())
                .brandName(b.getMotorcycle().getBrand().getName())
                .bookingDate(b.getBookingDate()).bookingTime(b.getBookingTime())
                .customerName(b.getCustomerName()).customerPhone(b.getCustomerPhone())
                .note(b.getNote()).status(b.getStatus()).createdAt(b.getCreatedAt())
                .build();
    }
}
