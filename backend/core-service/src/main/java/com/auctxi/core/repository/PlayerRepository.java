package com.auctxi.core.repository;

import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.PlayerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, String>, JpaSpecificationExecutor<Player> {

    Page<Player> findAll(Specification<Player> spec, Pageable pageable);

    java.util.List<Player> findByCreatedByUserId(String userId);
}
