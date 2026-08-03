package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.UserCreateRequest;
import com.auctxi.core.dto.request.UserUpdateRequest;
import com.auctxi.core.dto.response.MessageResponse;
import com.auctxi.core.dto.response.PageResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.User;
import com.auctxi.core.entity.UserStatus;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.repository.spec.UserSpecification;
import com.auctxi.core.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the User Service.
 *
 * Handles the core business logic for user management, including profile
 * updates and administrative CRUD operations.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieves the profile of the currently logged-in user.
     */
    @Override
    public UserSummaryResponse getProfile(String email) {
        /*
         STEP 1: Load User
         We look up the user by email (extracted from the JWT token).
         */
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        /*
         STEP 2: Map and Return
         Convert the sensitive User entity into a safe UserSummaryResponse.
         */
        return mapToSummary(user);
    }

    /**
     * Updates the basic profile information of the logged-in user.
     */
    @Override
    @Transactional
    public MessageResponse updateProfile(String email, UserUpdateRequest request) {
        /*
         STEP 1: Load Data
         */
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        /*
         STEP 2: Business Logic
         Only update fields that are explicitly provided in the request.
         */
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        
        /*
         STEP 3: Save Data
         */
        userRepository.save(user);
        
        return new MessageResponse("Profile updated successfully");
    }

    /**
     * Retrieves a paginated and filtered list of all users. For Admin use only.
     */
    @Override
    public PageResponse<UserSummaryResponse> getAllUsers(int page, int size, String sortBy, String sortDir, String search, Role role, UserStatus status) {
        /*
         STEP 1: Create Pagination Request
         Determine the sort direction and create a PageRequest object.
         */
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        /*
         STEP 2: Build Dynamic Query Specification
         We use Spring Data JPA Specifications to dynamically filter by search text, role, or status.
         */
        Specification<User> spec = Specification.where(UserSpecification.searchByNameOrEmail(search))
                .and(UserSpecification.hasRole(role))
                .and(UserSpecification.hasStatus(status));

        /*
         STEP 3: Execute Query
         */
        Page<User> users = userRepository.findAll(spec, pageable);
        
        /*
         STEP 4: Map Results
         Transform the Page of User entities into a PageResponse of UserSummaryResponses.
         */
        List<UserSummaryResponse> content = users.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());
                
        return PageResponse.<UserSummaryResponse>builder()
                .content(content)
                .pageNo(users.getNumber())
                .pageSize(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .last(users.isLast())
                .build();
    }

    /**
     * Retrieves a specific user by their ID. For Admin use only.
     */
    @Override
    public UserSummaryResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToSummary(user);
    }

    /**
     * Creates a new user directly from the Admin dashboard.
     */
    @Override
    @Transactional
    public MessageResponse createUser(UserCreateRequest request) {
        /*
         STEP 1: Validate Request
         */
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        /*
         STEP 2: Logic and Save
         */
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();
                
        userRepository.save(user);
        return new MessageResponse("User created successfully");
    }

    /**
     * Updates an existing user's details, role, or status. For Admin use only.
     */
    @Override
    @Transactional
    public MessageResponse updateUser(String id, UserUpdateRequest request) {
        /*
         STEP 1: Load Data
         */
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        /*
         STEP 2: Logic
         Apply updates dynamically. We don't overwrite fields that weren't provided.
         */
        if (request.getName() != null) user.setName(request.getName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        /*
         STEP 3: Save Data
         */
        userRepository.save(user);
        return new MessageResponse("User updated successfully");
    }

    /**
     * Soft deletes a user (sets status to INACTIVE rather than removing from DB).
     */
    @Override
    @Transactional
    public MessageResponse deleteUser(String id) {
        /*
         STEP 1: Load Data
         */
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        /*
         STEP 2: Soft Delete
         Instead of deleting the row (which would break foreign keys in the Auctions/Bids tables),
         we mark the user as INACTIVE.
         */
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        
        return new MessageResponse("User deactivated successfully");
    }
    
    /**
     * Helper method to map a User entity to a safe UserSummaryResponse.
     */
    private UserSummaryResponse mapToSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
