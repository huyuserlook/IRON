package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.*;
import com.example.IRON.dto.response.JwtResponse;
import com.example.IRON.dto.response.UserResponse;

public interface AuthService {
    JwtResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    JwtResponse socialLogin(SocialLoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void forgotPasswordByPhone(PhoneForgotPasswordRequest request);
    void resetPasswordByPhone(PhoneResetPasswordRequest request);
}