package com.auctxi.core.service;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.stream.Stream;

/**
 * StorageService defines the contract for handling file uploads within the AuctXI system.
 * 
 * EDUCATIONAL NOTE: Interface Abstraction
 * We use an interface here so the underlying storage mechanism can be easily swapped.
 * Currently, we will use a local FileSystemStorageService, but in a production environment,
 * we could implement an S3StorageService (AWS) or GCSStorageService (Google Cloud) 
 * without changing the MediaController logic.
 */
public interface StorageService {
    
    /**
     * Initializes the storage directory if it doesn't exist.
     */
    void init();

    /**
     * Stores the file and returns the unique generated filename.
     * 
     * @param file the MultipartFile to store
     * @return the generated filename
     */
    String store(MultipartFile file);

    /**
     * Loads a file path by filename.
     */
    Path load(String filename);
}
