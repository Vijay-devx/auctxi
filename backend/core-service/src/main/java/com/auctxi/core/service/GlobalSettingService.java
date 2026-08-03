package com.auctxi.core.service;

import com.auctxi.core.entity.GlobalSetting;
import com.auctxi.core.repository.GlobalSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlobalSettingService {

    private final GlobalSettingRepository globalSettingRepository;

    public List<GlobalSetting> getAllSettings() {
        return globalSettingRepository.findAll();
    }

    public GlobalSetting updateSetting(String key, String value) {
        GlobalSetting setting = globalSettingRepository.findByKey(key)
                .orElseGet(() -> {
                    GlobalSetting newSetting = new GlobalSetting();
                    newSetting.setKey(key);
                    return newSetting;
                });
        setting.setValue(value);
        return globalSettingRepository.save(setting);
    }
}
