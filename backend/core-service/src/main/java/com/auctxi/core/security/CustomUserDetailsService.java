package com.auctxi.core.security;

import com.auctxi.core.entity.User;
import com.auctxi.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Service that Spring Security uses to load a user from the database during authentication.
 *
 * When a user tries to log in, Spring Security calls `loadUserByUsername`.
 * We implement this interface to tell Spring to look up the user in our MySQL database
 * using our UserRepository, rather than an in-memory list.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new CustomUserDetails(user);
    }
}
