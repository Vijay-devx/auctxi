package com.auctxi.core.repository.spec;

import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.auctxi.core.entity.Role;
import jakarta.persistence.criteria.Predicate;

public class PlayerSpecification {

    public static Specification<Player> isVisibleTo(String userId, Role role) {
        return (root, query, cb) -> {
            if (role == Role.ROLE_ADMIN) {
                return cb.conjunction(); // Admin sees all
            } else {
                return cb.equal(root.get("createdByUser").get("id"), userId);
            }
        };
    }

    public static Specification<Player> hasRole(PlayerRole role) {
        return (root, query, cb) -> role == null ? null : cb.equal(root.get("role"), role);
    }

    public static Specification<Player> hasCategory(PlayerCategory category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }



    public static Specification<Player> search(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return null;
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), likePattern);
        };
    }
}
