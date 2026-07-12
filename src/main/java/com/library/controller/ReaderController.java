package com.library.controller;

import com.library.dto.request.ReaderUpdateRequest;
import com.library.dto.response.UserProfile;
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

    public ReaderController(UserService userService) {
        this.userService = userService;
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
}
