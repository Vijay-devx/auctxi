package com.auctxi.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Custom Filter that intercepts every HTTP request to check for a JWT token.
 *
 * If a valid token is found in the "Authorization" header, this filter extracts
 * the user details and manually authenticates the user in Spring's SecurityContext.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * This method runs once per HTTP request.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        /*
         STEP 1
         Extract the JWT string from the "Authorization: Bearer <token>" header.
         */
        String token = getTokenFromRequest(request);

        /*
         STEP 2
         If a token exists and is valid (not expired, cryptographically secure),
         extract the username and load the user's details from the database.
         */
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsername(token);

            try {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                /*
                 STEP 3
                 Create an Authentication token and place it in the SecurityContext.
                 This tells Spring Security: "This user is fully authenticated for this request."
                 */
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } catch (Exception e) {
                // User no longer exists in DB, ignore token
            }
        }

        /*
         STEP 4
         Continue the filter chain. If we didn't authenticate the user, they will be
         rejected when they reach a protected controller endpoint.
         */
        filterChain.doFilter(request, response);
    }

    /**
     * Helper method to parse the "Authorization" header.
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        // The token must start with "Bearer ", so we extract everything after index 7.
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
