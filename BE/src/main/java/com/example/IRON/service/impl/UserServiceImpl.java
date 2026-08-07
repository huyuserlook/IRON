package com.example.IRON.service.impl;

import com.example.IRON.dto.request.UpdateProfileRequest;
import com.example.IRON.dto.response.UserResponse;
import com.example.IRON.entity.Role;
import com.example.IRON.entity.User;
import com.example.IRON.exception.DuplicateResourceException;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse getProfile(Long userId) {
        return toResponse(userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId)));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!Objects.equals(user.getEmail(), request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email đã được sử dụng: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse toResponse(User user) {
        String role = "ROLE_USER";
        for (Role r : user.getRoles()) {
            role = r.getName().name();
            break;
        }
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setPhone(user.getPhone());
        res.setAddress(user.getAddress());
        res.setAvatarUrl(user.getAvatarUrl());
        res.setEnabled(user.getEnabled());
        res.setDeleted(user.getDeleted());
        res.setRole(role);
        res.setCreatedAt(user.getCreatedAt());
        res.setResetTokenApproved(user.getResetTokenApproved());
        res.setPasswordResetRequestedAt(user.getPasswordResetRequestedAt());
        return res;
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByDeletedFalse(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void approvePasswordReset(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getResetToken() == null || user.getResetTokenExpiry() == null) {
            throw new RuntimeException("Người dùng chưa gửi yêu cầu đặt lại mật khẩu");
        }

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Yêu cầu đặt lại mật khẩu đã hết hạn");
        }

        user.setResetTokenApproved(true);
        userRepository.save(user);
    }

    @Override
    public Page<UserResponse> getPendingPasswordResetRequests(Pageable pageable) {
        return userRepository.findPendingPasswordResetRequests(pageable).map(this::toResponse);
    }
}