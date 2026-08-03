package com.auctxi.core.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamSummaryResponse {
    private String id;
    private String name;
    private String shortName;
    private String logoUrl;
}
