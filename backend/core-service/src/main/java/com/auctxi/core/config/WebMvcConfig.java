package com.auctxi.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration to serve uploaded media files from the local file system.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${auctxi.storage.location:uploads}")
    private String storageLocation;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(storageLocation);
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        if (!uploadPath.endsWith("/")) {
            uploadPath += "/";
        }

        // Map requests to /uploads/** to the absolute path of the local uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/" + uploadPath);
    }
}
