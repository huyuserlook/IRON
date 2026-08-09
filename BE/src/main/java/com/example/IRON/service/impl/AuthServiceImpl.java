package com.example.IRON.service.impl;

import com.example.IRON.dto.request.*;
import com.example.IRON.dto.response.JwtResponse;
import com.example.IRON.dto.response.UserResponse;
import com.example.IRON.entity.AuthProvider;
import com.example.IRON.entity.Role;
import com.example.IRON.entity.User;
import com.example.IRON.exception.DuplicateResourceException;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.RoleRepository;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.security.JwtTokenProvider;
import com.example.IRON.service.interfaces.AuthService;
import com.example.IRON.service.interfaces.NotificationService;
import com.example.IRON.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.net.URI;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final EsmsService smsService;
    private final NotificationService notificationService;


    @Override
    public JwtResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        String token = jwtTokenProvider.generateToken(auth);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String role = user.getRoles().stream()
                .map(r -> r.getName().name())
                .findFirst().orElse("ROLE_USER");

        return JwtResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã được sử dụng: " + request.getEmail());
        }

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(Role.RoleName.ROLE_USER);
                    return roleRepository.save(newRole);
                });

        // Đảm bảo ROLE_ADMIN cũng tồn tại nếu cần
        if (roleRepository.findByName(Role.RoleName.ROLE_ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(Role.RoleName.ROLE_ADMIN);
            roleRepository.save(adminRole);
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        
        // Nếu là user đầu tiên trong hệ thống, cho làm ADMIN
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(Role.RoleName.ROLE_ADMIN);
                        return roleRepository.save(newRole);
                    });
            user.setRoles(Set.of(userRole, adminRole));
        } else {
            user.setRoles(Set.of(userRole));
        }
        
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(true);

        userRepository.save(user);

        notificationService.createNotification(
                "USER",
                "Người dùng mới",
                user.getFullName() + " (" + user.getEmail() + ")",
                "/admin/users",
                user.getId()
        );

        return userService.toResponse(user);
    }

    @Override
    @Transactional
    public JwtResponse socialLogin(SocialLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.getEmail());
                    newUser.setFullName(request.getFullName());
                    newUser.setAvatarUrl(request.getAvatarUrl());
                    newUser.setProvider(request.getProvider());
                    newUser.setProviderId(request.getProviderId());
                    newUser.setEnabled(true);

                    Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                            .orElseGet(() -> {
                                Role newRole = new Role();
                                newRole.setName(Role.RoleName.ROLE_USER);
                                return roleRepository.save(newRole);
                            });
                     newUser.setRoles(Set.of(userRole));
                      return userRepository.save(newUser);
                 });

        // Nếu user đã tồn tại nhưng chưa có provider_id (đăng ký thường trước đó)
        if (user.getProviderId() == null) {
            user.setProvider(request.getProvider());
            user.setProviderId(request.getProviderId());
            if (user.getAvatarUrl() == null) {
                user.setAvatarUrl(request.getAvatarUrl());
            }
            userRepository.save(user);
        }

        String role = user.getRoles().stream()
                .map(r -> r.getName().name())
                .findFirst().orElse("ROLE_USER");

        // Tạo Authentication giả cho Social Login
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, Collections.singletonList(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        return JwtResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .avatarUrl(user.getAvatarUrl())
                .build();
    }


    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // TODO: Gửi email thực tế ở đây
        System.out.println("RESET PASSWORD TOKEN FOR " + user.getEmail() + ": " + token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Token", "value", request.getToken()));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPasswordByPhone(PhoneForgotPasswordRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User", "phone", request.getPhone()));

        user.setResetToken(java.util.UUID.randomUUID().toString());
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        user.setResetTokenApproved(false);
        user.setPasswordResetRequestedAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.createNotification(
                "PASSWORD_RESET",
                "Yêu cầu đổi mật khẩu",
                user.getFullName() + " (" + (user.getPhone() != null ? user.getPhone() : user.getEmail()) + ") yêu cầu đặt lại mật khẩu",
                "/admin/password-reset-requests",
                user.getId()
        );
    }

    @Override
    @Transactional
    public void resetPasswordByPhone(PhoneResetPasswordRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User", "phone", request.getPhone()));

        if (user.getResetToken() == null || Boolean.FALSE.equals(user.getResetTokenApproved())) {
            throw new RuntimeException("Yêu cầu đặt lại mật khẩu chưa được admin xác nhận");
        }

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Yêu cầu đặt lại mật khẩu đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setResetTokenApproved(null);
        user.setPasswordResetRequestedAt(null);
        userRepository.save(user);
    }
}
