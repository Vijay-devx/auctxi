package com.auctxi.core.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;

/**
 * Core Security Configuration for the Spring Boot application.
 *
 * This class configures how the application secures its endpoints, how it handles CORS,
 * and ensures that our custom JWT filter intercepts requests before they reach the controllers.
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter authenticationFilter;
    
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Defines the BCrypt password encoder used to hash user passwords.
     */
    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Exposes Spring Security's AuthenticationManager as a Bean so we can use it
     * in our AuthServiceImpl to verify credentials.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * Configures the main security filter chain.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        /*
         STEP 1
         Enable CORS and disable CSRF. We disable CSRF because our API is stateless
         and relies on JWT tokens (which are immune to traditional CSRF if stored properly).
         */
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable());

        /*
         STEP 2
         Define which endpoints require authentication and which are public.
         */
        http.authorizeHttpRequests(authorize -> authorize
                // Public authentication endpoints (Login, Register, Forgot Password)
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                // Public Swagger UI endpoints
                .requestMatchers(
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/swagger-resources/**",
                        "/webjars/**"
                ).permitAll()
                // Public WebSocket endpoint
                .requestMatchers("/ws-auction/**").permitAll()
                // Public Media endpoint
                .requestMatchers("/uploads/**").permitAll()
                // Internal API for microservices (AI service)
                .requestMatchers("/api/internal/**").permitAll()
                // Permit Async Dispatch for SSE streaming
                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ASYNC).permitAll()
                // Allow actuator endpoints (like /actuator/health) for Docker healthcheck
                .requestMatchers("/actuator/**").permitAll()
                // All other endpoints require a valid JWT token
                .anyRequest().authenticated()
        );

        /*
         STEP 3
         Set session management to STATELESS. Spring Security will not create or use 
         HTTPSessions; it will rely entirely on the JWT token provided in each request.
         */
        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        /*
         STEP 4
         Add our custom JWT filter before Spring's default authentication filter.
         This ensures our filter processes the JWT token first.
         */
        http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
