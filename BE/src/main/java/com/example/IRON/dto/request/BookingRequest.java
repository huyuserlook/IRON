package com.example.IRON.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    @NotNull(message = "Xe khong duoc de trong")
    private Long motorcycleId;

    @NotNull(message = "Ngay dat lich khong duoc de trong")
    @FutureOrPresent(message = "Ngay dat lich khong duoc o qua khu")
    private LocalDate bookingDate;

    @NotNull(message = "Gio dat lich khong duoc de trong")
    private LocalTime bookingTime;

    @NotBlank(message = "Ten khach hang khong duoc de trong")
    private String customerName;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    private String customerPhone;

    private String note;
}
