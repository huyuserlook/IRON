package com.example.IRON.service.interfaces;

import com.example.IRON.dto.response.UserResponse;
import com.example.IRON.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getProfile(Long userId);
    UserResponse toResponse(User user);
    Page<UserResponse> getAllUsers(Pageable pageable);
    void toggleUserStatus(Long userId);
    void deleteUser(Long userId);
}