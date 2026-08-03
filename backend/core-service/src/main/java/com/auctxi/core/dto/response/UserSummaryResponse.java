package com.auctxi.core.dto.response;

import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
}
