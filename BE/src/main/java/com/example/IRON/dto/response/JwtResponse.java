package com.example.IRON.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
}
