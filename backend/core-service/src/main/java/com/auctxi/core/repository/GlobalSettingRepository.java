package com.auctxi.core.repository;

import com.auctxi.core.entity.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, Long> {
    Optional<GlobalSetting> findByKey(String key);
}
