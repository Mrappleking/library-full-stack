package com.library.controller;

import com.library.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final String UPLOAD_DIR = "src/main/resources/static/covers/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/cover")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadCover(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可上传封面"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件不能为空"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件大小不能超过5MB"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.matches(".*\\.(jpg|jpeg|png|gif)$")) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("只支持图片格式(jpg/jpeg/png/gif)"));
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            file.transferTo(new File(UPLOAD_DIR + filename));
            String url = "/covers/" + filename;

            return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("path", url, "filename", filename)));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.serverError("文件上传失败"));
        }
    }
}