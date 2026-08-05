package com.example.IRON.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không quá 100 ký tự")
    private String name;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại không quá 20 ký tự")
    private String phone;

@NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 150, message = "Email không quá 150 ký tự")
    private String email;

    @Size(max = 200, message = "Chủ đề không quá 200 ký tự")
    private String subject;

    @Size(max = 2000, message = "Nội dung không quá 2000 ký tự")
    private String message;
}
