package com.example.IRON.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Ho ten khong duoc de trong")
    @Size(max = 100, message = "Ho ten khong duoc qua 100 ky tu")
    private String fullName;

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong hop le")
    private String email;

    @Size(max = 15, message = "So dien thoai khong duoc qua 15 ky tu")
    private String phone;

    private String address;
}
