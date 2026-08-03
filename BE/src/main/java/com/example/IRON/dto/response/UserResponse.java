package com.example.IRON.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String avatarUrl;
    private Boolean enabled;
    private String role;
    private LocalDateTime createdAt;

    public UserResponse() {}
}