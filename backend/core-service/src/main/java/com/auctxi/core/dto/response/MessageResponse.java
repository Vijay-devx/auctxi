package com.auctxi.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A generic response object used for simple success or informative messages.
 *
 * Example Usage: "Password reset successful" or "Item deleted successfully".
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String message;
}
