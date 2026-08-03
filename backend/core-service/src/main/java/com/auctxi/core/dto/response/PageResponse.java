package com.auctxi.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * A generic wrapper for paginated API responses.
 *
 * Rather than returning a raw array of items, this class encapsulates the data
 * along with pagination metadata, making it easier for the frontend to render
 * pagination controls (e.g., "Page 1 of 10").
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNo;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
