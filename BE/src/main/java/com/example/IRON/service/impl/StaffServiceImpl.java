package com.example.IRON.service.impl;

import com.example.IRON.dto.response.BookingResponse;
import com.example.IRON.dto.response.MotorcycleResponse;
import com.example.IRON.dto.response.OrderResponse;
import com.example.IRON.entity.Booking;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.entity.Order;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.BookingRepository;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.service.interfaces.BookingService;
import com.example.IRON.service.interfaces.MotorcycleService;
import com.example.IRON.service.interfaces.OrderService;
import com.example.IRON.service.interfaces.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final OrderService orderService;
    private final BookingService bookingService;
    private final MotorcycleService motorcycleService;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderService::toResponse);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        return orderService.getById(id);
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        return orderService.updateStatus(id, orderStatus);
    }

    @Override
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(bookingService::toResponse);
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return bookingService.toResponse(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(Long id, String status) {
        Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        return bookingService.updateStatus(id, bookingStatus);
    }

    @Override
    public Page<MotorcycleResponse> getAllMotorcycles(Pageable pageable) {
        return motorcycleService.search(null, null, null, null, null, null, pageable);
    }
}
