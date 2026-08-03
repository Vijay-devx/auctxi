package com.auctxi.core.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class PlayerAssignmentRequest {
    private List<String> playerIds;
}
