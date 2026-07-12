package com.library.controller;

import com.library.dto.request.ReaderUpdateRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.UserProfile;
import com.library.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readers")
public class ReaderController {

    private final UserService userService;

    public ReaderController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfile>>> list() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfile>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(userService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfile>> update(@PathVariable Integer id, @Valid @RequestBody ReaderUpdateRequest data) {
        return ResponseEntity.ok(ApiResponse.success("读者信息更新成功", userService.update(id, data.getName(), data.getPhone(), data.getEmail())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfile>> updateProfile(HttpServletRequest request, @Valid @RequestBody ReaderUpdateRequest data) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.success("个人信息更新成功", userService.update(userId, data.getName(), data.getPhone(), data.getEmail())));
    }
}