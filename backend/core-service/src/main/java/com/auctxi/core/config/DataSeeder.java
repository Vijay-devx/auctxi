package com.auctxi.core.config;

import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatus;
import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.Team;
import com.auctxi.core.entity.User;
import com.auctxi.core.entity.UserStatus;
import com.auctxi.core.entity.Notification;
import com.auctxi.core.repository.NotificationRepository;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Initializes the database with default data when the application starts.
 *
 * This class ensures that the essential roles (Admin, Manager, Client) exist
 * so developers can immediately log in and start using the system.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            log.info("Checking for seed data...");

            seedAdminUser();
            seedManagerUser();
            seedClientUser();

            log.info("Seed data initialization complete.");
        };
    }

    /**
     * Creates a default Super Admin account if one doesn't exist.
     */
    private void seedAdminUser() {
        User admin = userRepository.findByEmail("admin@auctxi.com").orElse(new User());
        admin.setName("Super Admin");
        admin.setEmail("admin@auctxi.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
        log.info("Seeded/Updated Admin user (admin@auctxi.com / admin123)");

        // Seed mock notifications for Admin
        if (notificationRepository.findByUserIdOrderByCreatedAtDesc(admin.getId()).isEmpty()) {
            Notification n1 = Notification.builder()
                .userId(admin.getId())
                .title("Welcome to AuctXI")
                .message("Your admin account has been successfully configured and is ready to use.")
                .isRead(false)
                .actionUrl("/admin/dashboard")
                .createdAt(java.time.LocalDateTime.now().minusHours(2))
                .build();
            Notification n2 = Notification.builder()
                .userId(admin.getId())
                .title("New Team Registered")
                .message("The team 'Mumbai Indians' has successfully registered for the upcoming auction.")
                .isRead(false)
                .actionUrl("/admin/teams")
                .createdAt(java.time.LocalDateTime.now().minusMinutes(45))
                .build();
            Notification n3 = Notification.builder()
                .userId(admin.getId())
                .title("System Maintenance")
                .message("A scheduled system maintenance will occur in 24 hours.")
                .isRead(false)
                .actionUrl("/admin/settings")
                .createdAt(java.time.LocalDateTime.now().minusMinutes(5))
                .build();
            notificationRepository.saveAll(List.of(n1, n2, n3));
            log.info("Seeded mock notifications for Admin");
        }
    }

    /**
     * Creates a default Manager account if one doesn't exist.
     */
    private void seedManagerUser() {
        User manager = userRepository.findByEmail("manager@auctxi.com").orElse(new User());
        manager.setName("Auction Manager");
        manager.setEmail("manager@auctxi.com");
        manager.setPassword(passwordEncoder.encode("manager123"));
        manager.setRole(Role.ROLE_MANAGER);
        manager.setStatus(UserStatus.ACTIVE);
        userRepository.save(manager);
        log.info("Seeded/Updated Manager user (manager@auctxi.com / manager123)");
    }

    /**
     * Creates a default Client account if one doesn't exist.
     */
    private void seedClientUser() {
        User clientUser = userRepository.findByEmail("client@auctxi.com").orElse(new User());
        clientUser.setName("Team Owner");
        clientUser.setEmail("client@auctxi.com");
        clientUser.setPassword(passwordEncoder.encode("client123"));
        clientUser.setRole(Role.ROLE_CLIENT);
        clientUser.setStatus(UserStatus.ACTIVE);
        userRepository.save(clientUser);
        log.info("Seeded/Updated Client user (client@auctxi.com / client123)");
    }
}
