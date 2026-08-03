package com.auctxi.core.dto.request;

import lombok.Data;

@Data
public class AuctionUpdateRequest {
    private String name;
    private AuctionRulesRequest rules;
}
