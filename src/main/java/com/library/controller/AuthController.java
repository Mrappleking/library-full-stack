package com.library.controller;

import com.library.dto.request.ChangePasswordRequest;
import com.library.dto.request.LoginRequest;
import com.library.dto.request.RegisterRequest;
import com.library.dto.response.LoginResponse;
import com.library.dto.response.UserProfile;
import com.library.exception.AppException;
import com.library.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(data));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest data) {
        return ResponseEntity.ok(authService.login(data.getUsername(), data.getPassword()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> getMe(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(authService.getMe(userId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfile>> listUsers(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            throw AppException.forbidden("仅管理员可执行此操作");
        }
        return ResponseEntity.ok(authService.listUsers());
    }

    @PostMapping("/admin/create")
    public ResponseEntity<UserProfile> createAdmin(@Valid @RequestBody RegisterRequest data, HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            throw AppException.forbidden("仅管理员可执行此操作");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createAdmin(data));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest data, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        authService.changePassword(userId, data.getOldPassword(), data.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancel-account")
    public ResponseEntity<Void> cancelAccount(@RequestBody java.util.Map<String, String> body, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String password = body != null ? body.get("password") : null;
        if (password == null || password.isEmpty()) {
            throw AppException.badRequest("请输入密码以确认注销");
        }
        authService.cancelAccount(userId, password);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        authService.logout(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/force-logout/{userId}")
    public ResponseEntity<Void> forceLogout(@PathVariable Integer userId, HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            throw AppException.forbidden("仅管理员可执行此操作");
        }
        authService.forceLogout(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/delete-user/{userId}")
    public ResponseEntity<Void> adminDeleteUser(@PathVariable Integer userId, HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            throw AppException.forbidden("仅管理员可执行此操作");
        }
        authService.adminDeleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
