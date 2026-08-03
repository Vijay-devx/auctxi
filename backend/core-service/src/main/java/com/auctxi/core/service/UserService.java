package com.auctxi.core.service;

import com.auctxi.core.dto.request.UserCreateRequest;
import com.auctxi.core.dto.request.UserUpdateRequest;
import com.auctxi.core.dto.response.MessageResponse;
import com.auctxi.core.dto.response.PageResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.UserStatus;

public interface UserService {
    UserSummaryResponse getProfile(String email);
    MessageResponse updateProfile(String email, UserUpdateRequest request);

    PageResponse<UserSummaryResponse> getAllUsers(int page, int size, String sortBy, String sortDir, String search, Role role, UserStatus status);
    UserSummaryResponse getUserById(String id);
    MessageResponse createUser(UserCreateRequest request);
    MessageResponse updateUser(String id, UserUpdateRequest request);
    MessageResponse deleteUser(String id);
}
