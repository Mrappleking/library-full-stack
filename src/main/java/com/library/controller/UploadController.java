package com.library.controller;

import com.library.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${app.upload.cover-dir:${user.dir}/src/main/resources/static/covers}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif"
    );

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
        if (originalFilename == null) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件名不能为空"));
        }

        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件名不合法"));
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("只支持图片格式(jpg/jpeg/png/gif)"));
        }

        String contentType = file.getContentType();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件类型不支持"));
        }

        String filename = UUID.randomUUID().toString() + "." + extension.toLowerCase();

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(filename).normalize();
            if (!targetPath.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件路径不合法"));
            }

            file.transferTo(targetPath.toFile());
            String url = "/covers/" + filename;

            return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("path", url, "filename", filename)));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.serverError("文件上传失败"));
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}