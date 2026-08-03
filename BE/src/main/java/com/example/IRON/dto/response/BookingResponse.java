package com.example.IRON.dto.response;

import com.example.IRON.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long motorcycleId;
    private String motorcycleName;
    private String motorcycleThumbnail;
    private String brandName;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String customerName;
    private String customerPhone;
    private String note;
    private Booking.BookingStatus status;
    private LocalDateTime createdAt;
}
