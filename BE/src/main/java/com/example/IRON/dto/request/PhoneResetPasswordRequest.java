package com.example.IRON.dto.request;

import com.example.IRON.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhoneResetPasswordRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @ValidPassword
    private String newPassword;
}
