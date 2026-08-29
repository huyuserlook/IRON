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
    private Boolean deleted;
    private String role;
    private LocalDateTime createdAt;
    private Boolean resetTokenApproved;
    private LocalDateTime passwordResetRequestedAt;

    public UserResponse() {}
}