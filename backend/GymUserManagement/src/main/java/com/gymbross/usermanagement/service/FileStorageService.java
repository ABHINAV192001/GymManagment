package com.gymbross.usermanagement.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads/diet-plans").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
        // Simple validation only PDF
        if (!originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Only PDF files are allowed.");
        }

        try {
            // Check if the file's name contains invalid characters
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            // Generate a unique file name
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Path loadFileAsPath(String fileName) {
        return this.fileStorageLocation.resolve(fileName).normalize();
    }
}
