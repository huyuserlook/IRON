package com.example.IRON.service.interfaces;

import com.example.IRON.dto.response.BookingResponse;
import com.example.IRON.dto.response.MotorcycleResponse;
import com.example.IRON.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffService {
    Page<OrderResponse> getAllOrders(Pageable pageable);
    OrderResponse getOrderById(Long id);
    OrderResponse updateOrderStatus(Long id, String status);

    Page<BookingResponse> getAllBookings(Pageable pageable);
    BookingResponse getBookingById(Long id);
    BookingResponse updateBookingStatus(Long id, String status);

    Page<MotorcycleResponse> getAllMotorcycles(Pageable pageable);
}
