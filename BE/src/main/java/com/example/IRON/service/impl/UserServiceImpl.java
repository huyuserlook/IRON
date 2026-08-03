package com.example.IRON.service.impl;

import com.example.IRON.dto.response.UserResponse;
import com.example.IRON.entity.Role;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        res.setRole(role);
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
    }
}