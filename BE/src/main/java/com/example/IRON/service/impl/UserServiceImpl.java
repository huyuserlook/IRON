package com.example.IRON.service.impl;

import com.example.IRON.dto.request.UpdateProfileRequest;
import com.example.IRON.dto.response.UserResponse;
import com.example.IRON.entity.AuthProvider;
import com.example.IRON.entity.Role;
import com.example.IRON.entity.RoleChangeLog;
import com.example.IRON.entity.User;
import com.example.IRON.exception.DuplicateResourceException;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.exception.UnauthorizedException;
import com.example.IRON.repository.RoleChangeLogRepository;
import com.example.IRON.repository.RoleRepository;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleChangeLogRepository roleChangeLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, RoleChangeLogRepository roleChangeLogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.roleChangeLogRepository = roleChangeLogRepository;
        this.passwordEncoder = passwordEncoder;
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
    public Page<UserResponse> getStaffUsers(Pageable pageable) {
        return userRepository.findStaffUsers(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public UserResponse createStaff(String fullName, String email, String rawPassword, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được sử dụng: " + email);
        }

        Role staffRole = roleRepository.findByName(Role.RoleName.ROLE_STAFF)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(Role.RoleName.ROLE_STAFF);
                    return roleRepository.save(newRole);
                });

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhone(phone);
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(true);
        user.setRoles(Set.of(staffRole));

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long actorId, String actorEmail, Long targetId, String newRoleName, String note) {
        if (actorId.equals(targetId)) {
            throw new UnauthorizedException("Bạn không thể thay đổi vai trò của chính mình");
        }

        User targetUser = userRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetId));

        String oldRoleName = "ROLE_USER";
        for (Role r : targetUser.getRoles()) {
            oldRoleName = r.getName().name();
            break;
        }

        if (oldRoleName.equals(newRoleName)) {
            return toResponse(targetUser);
        }

        Role.RoleName roleEnum = Role.RoleName.valueOf(newRoleName);
        Role newRole = roleRepository.findByName(roleEnum)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(roleEnum);
                    return roleRepository.save(r);
                });

        Set<Role> newRoles = new java.util.HashSet<>();
        newRoles.add(newRole);

        // Keep other roles if needed, or replace entirely. 
        // Since User has many-to-many, we replace the roles set.
        targetUser.setRoles(newRoles);
        userRepository.save(targetUser);

        roleChangeLogRepository.save(new RoleChangeLog(
                actorId,
                actorEmail,
                targetId,
                targetUser.getEmail(),
                oldRoleName,
                newRoleName,
                note
        ));

        return toResponse(targetUser);
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
