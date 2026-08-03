package com.auctxi.core.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardized Error Response Data Transfer Object (DTO).
 *
 * Whenever an API request fails, the server responds with this exact structure.
 * This consistency allows the React frontend to easily parse and display errors.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
