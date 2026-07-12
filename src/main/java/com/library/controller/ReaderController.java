package com.library.controller;

import com.library.dto.request.ReaderUpdateRequest;
import com.library.dto.response.UserProfile;
import com.library.exception.AppException;
import com.library.service.AuthService;
import com.library.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/readers")
public class ReaderController {

    private final UserService userService;
    private final AuthService authService;

    public ReaderController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<UserProfile> all = userService.findAll();
        List<UserProfile> readers = all.stream()
                .filter(u -> "reader".equals(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(readers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateByAdmin(@PathVariable Integer id, @RequestBody ReaderUpdateRequest data) {
        userService.update(id, data.getName(), data.getPhone(), data.getEmail());
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> selfUpdate(HttpServletRequest request, @RequestBody ReaderUpdateRequest data) {
        Integer userId = (Integer) request.getAttribute("userId");
        userService.update(userId, data.getName(), data.getPhone(), data.getEmail());
        return ResponseEntity.ok(userService.findById(userId));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Integer id, HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            throw AppException.forbidden("仅管理员可执行此操作");
        }
        authService.resetPassword(id);
        return ResponseEntity.ok().build();
    }
}
