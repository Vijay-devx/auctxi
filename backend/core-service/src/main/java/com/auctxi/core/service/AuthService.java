package com.auctxi.core.service;

import com.auctxi.core.dto.request.ForgotPasswordRequest;
import com.auctxi.core.dto.request.LoginRequest;
import com.auctxi.core.dto.request.RegisterRequest;
import com.auctxi.core.dto.request.ResetPasswordRequest;
import com.auctxi.core.dto.response.JwtAuthResponse;
import com.auctxi.core.dto.response.MessageResponse;

public interface AuthService {
    MessageResponse register(RegisterRequest registerDto);
    JwtAuthResponse login(LoginRequest loginDto);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
}
