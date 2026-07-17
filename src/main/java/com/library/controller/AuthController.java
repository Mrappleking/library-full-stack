package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.request.CancelAccountRequest;
import com.library.dto.request.ChangePasswordRequest;
import com.library.dto.request.LoginRequest;
import com.library.dto.request.RegisterRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.LoginResponse;
import com.library.dto.response.UserProfile;
import com.library.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest data) {
        return ResponseEntity.ok(ApiResponse.created(authService.register(data)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest data) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(data.getUsername(), data.getPassword())));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfile>> getMe(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.success(authService.getMe(userId)));
    }

    @GetMapping("/users")
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<UserProfile>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.success(authService.listUsers()));
    }

    @PostMapping("/admin/create")
    @RequireAdmin
    public ResponseEntity<ApiResponse<UserProfile>> createAdmin(@Valid @RequestBody RegisterRequest data) {
        return ResponseEntity.ok(ApiResponse.created(authService.createAdmin(data)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest data, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        authService.changePassword(userId, data);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/cancel-account")
    public ResponseEntity<ApiResponse<Void>> cancelAccount(@Valid @RequestBody CancelAccountRequest data, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        authService.cancelAccount(userId, data.getPassword());
        return ResponseEntity.ok(ApiResponse.success("账号已注销", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        authService.logout(userId);
        return ResponseEntity.ok(ApiResponse.success("已成功退出登录", null));
    }

    @PostMapping("/admin/force-logout/{userId}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Void>> forceLogout(@PathVariable Integer userId) {
        authService.forceLogout(userId);
        return ResponseEntity.ok(ApiResponse.success("用户已被强制下线", null));
    }

    @PostMapping("/admin/delete-user/{userId}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Void>> adminDeleteUser(@PathVariable Integer userId) {
        authService.adminDeleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("用户已删除", null));
    }
}