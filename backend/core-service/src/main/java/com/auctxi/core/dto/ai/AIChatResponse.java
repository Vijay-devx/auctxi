package com.auctxi.core.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIChatResponse {
    private String answer;
    private String liveDataUsed;
    private String analysis;
    private String recommendation;
    private List<String> suggestedNextActions;
}
