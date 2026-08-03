package com.auctxi.core.dto.request;

import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.UserStatus;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private Role role;
    private UserStatus status;
}
