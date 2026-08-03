package com.auctxi.core.service.ai;

import com.auctxi.core.dto.ai.AdminContextResponse;
import com.auctxi.core.dto.ai.ClientContextResponse;
import com.auctxi.core.dto.ai.ManagerContextResponse;

public interface AIContextService {
    ClientContextResponse getClientContext(String userId, String auctionId);
    ManagerContextResponse getManagerContext(String userId, String auctionId);
    AdminContextResponse getAdminContext(String userId);
}
