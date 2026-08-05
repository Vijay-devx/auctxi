package com.auctxi.core.controller;

import com.auctxi.core.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Media Management", description = "Endpoints for handling file uploads (images, logos)")
public class MediaController {

    private final StorageService storageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a media file", description = "Uploads an image (e.g. player photo, team logo) and returns its accessible URL.")
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        log.info("Received file upload request: {}", file.getOriginalFilename());
        
        String filename = storageService.store(file);
        
        // Return a relative path so the frontend browser can dynamically resolve the host
        String fileDownloadUri = "/uploads/" + filename;

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("url", fileDownloadUri);
        
        log.info("File stored successfully. URL: {}", fileDownloadUri);

        return ResponseEntity.ok(response);
    }
}
