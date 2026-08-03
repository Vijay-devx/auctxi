package com.auctxi.core.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.auctxi.core.entity.User;
import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Security Utility for generating and validating JSON Web Tokens (JWT).
 *
 * This class is responsible for creating a secure token when a user logs in,
 * and validating that token on subsequent API requests to ensure the user is authenticated.
 */
@Component
public class JwtTokenProvider {

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationDate;

    /**
     * Generates a JWT string containing the user's email as the subject.
     */
    public String generateToken(Authentication authentication) {
        /*
         STEP 1
         Extract the username (email) from the authenticated user object.
         This acts as the unique identifier inside the token payload.
         */
        String username = authentication.getName();

        /*
         STEP 2
         Calculate the expiration date based on the configured milliseconds.
         Tokens must expire to limit the window an attacker has if a token is stolen.
         */
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        /*
         STEP 3
         Build and cryptographically sign the token using the secret key.
         Include custom claims so the API Gateway can extract user context.
         */
        return Jwts.builder()
                .subject(username)
                .claim("id", user.getId())
                .claim("roles", user.getRole().name())
                .issuedAt(new Date())
                .expiration(expireDate)
                .signWith(key())
                .compact();
    }

    /**
     * Helper method to convert the Base64 encoded string secret into a cryptographic key.
     */
    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    /**
     * Extracts the username (email) from a validated token.
     */
    public String getUsername(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Validates that the token hasn't been tampered with and hasn't expired.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            // If any exception occurs during parsing, the token is invalid or expired.
            return false;
        }
    }
}
