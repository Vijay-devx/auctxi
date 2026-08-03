package com.auctxi.core.controller;

import com.auctxi.core.dto.request.UserCreateRequest;
import com.auctxi.core.dto.request.UserUpdateRequest;
import com.auctxi.core.dto.response.MessageResponse;
import com.auctxi.core.dto.response.PageResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.UserStatus;
import com.auctxi.core.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsible for User Management.
 *
 * This controller handles two types of endpoints:
 * 1. Profile Endpoints ("/me"): Accessible by any logged-in user to view/edit their own data.
 * 2. Admin Endpoints: Accessible only by users with ROLE_ADMIN to manage the entire platform.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for Profile and Admin User CRUD")
public class UserController {

    private final UserService userService;

    // --- Profile Endpoints (Accessible by any authenticated user) ---

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserSummaryResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<MessageResponse> updateProfile(Authentication authentication, 
                                                         @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    // --- Admin Endpoints (Accessible only by ADMIN) ---

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Get all users with pagination, sorting, and filtering")
    public ResponseEntity<PageResponse<UserSummaryResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status
    ) {
        return ResponseEntity.ok(userService.getAllUsers(page, size, sortBy, sortDir, search, role, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserSummaryResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Create a new user (Admin only)")
    public ResponseEntity<MessageResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return new ResponseEntity<>(userService.createUser(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Update user details, role, or status")
    public ResponseEntity<MessageResponse> updateUser(@PathVariable String id, 
                                                      @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Soft delete a user")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
}
