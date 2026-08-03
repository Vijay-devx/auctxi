package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.ForgotPasswordRequest;
import com.auctxi.core.dto.request.LoginRequest;
import com.auctxi.core.dto.request.RegisterRequest;
import com.auctxi.core.dto.request.ResetPasswordRequest;
import com.auctxi.core.dto.response.JwtAuthResponse;
import com.auctxi.core.dto.response.MessageResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.User;
import com.auctxi.core.entity.UserStatus;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.security.JwtTokenProvider;
import com.auctxi.core.service.AuthService;
import com.auctxi.core.service.NotificationFacade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation of the Authentication Service.
 *
 * This class contains the business logic for creating new users, verifying credentials
 * during login, and handling password resets.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationFacade notificationFacade;

    /**
     * Registers a new user in the system.
     */
    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        /*
         STEP 1
         Validate that the email is not already in use.
         */
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        /*
         STEP 2
         Build a new User entity. Notice how we immediately encode the raw password
         so that it is never saved in plaintext.
         */
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        /*
         STEP 3
         Save the user to the database and return a success message.
         */
        userRepository.save(user);

        /*
         STEP 4
         Dispatch a registration email via the NotificationFacade.
         */
        notificationFacade.sendRegistrationSuccess(user);

        return new MessageResponse("User registered successfully");
    }

    /**
     * Authenticates a user and generates a JWT.
     */
    @Override
    public JwtAuthResponse login(LoginRequest request) {
        /*
         STEP 1
         Use Spring Security's AuthenticationManager to verify the email and password.
         If the credentials are bad, this will throw a BadCredentialsException.
         */
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        /*
         STEP 2
         Store the authentication object in the SecurityContext so Spring knows this user is logged in.
         Then, generate the actual JWT token.
         */
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        /*
         STEP 3
         Extract the custom user details to build a summary object.
         This summary is sent back to the React frontend so it knows who just logged in.
         */
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        UserSummaryResponse userSummary = UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();

        return JwtAuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(userSummary)
                .build();
    }

    /**
     * Initiates the password reset process by generating a unique token.
     */
    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        /*
         STEP 1
         Load the user. If they don't exist, throw a 404 Exception.
         */
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        /*
         STEP 2
         Generate a secure, random token and save it to the user's record.
         */
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userRepository.save(user);

        /*
         STEP 3
         Dispatch the password reset token via the NotificationFacade.
         */
        log.info("Password reset token for {}: {}", user.getEmail(), resetToken);
        
        notificationFacade.sendPasswordReset(user, resetToken);

        return new MessageResponse("Password reset link sent to email");
    }

    /**
     * Finalizes the password reset process.
     */
    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        /*
         STEP 1
         Find the user that holds this specific reset token.
         */
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        /*
         STEP 2
         Update their password with a newly encoded version, and nullify the token
         so it cannot be reused.
         */
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        return new MessageResponse("Password reset successfully");
    }
}
