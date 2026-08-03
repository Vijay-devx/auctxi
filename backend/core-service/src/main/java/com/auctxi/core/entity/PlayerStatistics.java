package com.auctxi.core.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerStatistics {
    
    private Integer matches;
    private Integer runs;
    private Integer highestScore;
    private Double battingAverage;
    private Double strikeRate;

    private Integer wickets;
    private Integer bestBowlingWickets;
    private Integer bestBowlingRuns;
    private Double economy;

    private Integer catches;

}
