package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
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
    @RequireAdmin
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadCover(@RequestParam("file") MultipartFile file) {

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

        // 验证文件是否为真实图片
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage image = ImageIO.read(inputStream);
            if (image == null) {
                return ResponseEntity.badRequest().body(ApiResponse.badRequest("文件不是有效的图片格式"));
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("图片读取失败"));
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

            File targetFile = targetPath.toFile();
            if (targetFile == null) {
                return ResponseEntity.status(500).body(ApiResponse.serverError("文件路径无效"));
            }
            file.transferTo(targetFile);
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