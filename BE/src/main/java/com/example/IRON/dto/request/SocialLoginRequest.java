package com.example.IRON.dto.request;

import com.example.IRON.entity.AuthProvider;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SocialLoginRequest {
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Tên không được để trống")
    private String fullName;

    private String avatarUrl;

    @NotBlank(message = "Provider ID không được để trống")
    private String providerId;

    @NotNull(message = "Provider không được để trống")
    private AuthProvider provider;

    private String accessToken;
}
