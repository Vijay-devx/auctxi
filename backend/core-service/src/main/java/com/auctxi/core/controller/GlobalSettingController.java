package com.auctxi.core.controller;

import com.auctxi.core.entity.GlobalSetting;
import com.auctxi.core.service.GlobalSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class GlobalSettingController {

    private final GlobalSettingService globalSettingService;

    @GetMapping
    public ResponseEntity<List<GlobalSetting>> getAllSettings() {
        return ResponseEntity.ok(globalSettingService.getAllSettings());
    }

    @PutMapping("/{key}")
    public ResponseEntity<GlobalSetting> updateSetting(@PathVariable String key, @RequestBody Map<String, String> request) {
        String value = request.get("value");
        return ResponseEntity.ok(globalSettingService.updateSetting(key, value));
    }
}
