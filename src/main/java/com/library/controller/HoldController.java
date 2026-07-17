package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.request.HoldRequest;
import com.library.dto.response.ApiResponse;
import com.library.entity.Hold;
import com.library.service.HoldService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/holds")
public class HoldController {

    private final HoldService holdService;

    public HoldController(HoldService holdService) {
        this.holdService = holdService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Hold>> create(@Valid @RequestBody HoldRequest data, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("预约创建成功", holdService.createHold(userId, data.getBookId())));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingCount() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("pending", holdService.countPendingHolds())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Hold>>> getMyHolds(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.success(holdService.getMyHolds(userId)));
    }

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<Map<String, Object>>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer bookId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(holdService.listHolds(status, bookId, page, limit)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Integer id, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        holdService.cancelHold(id, userId);
        return ResponseEntity.ok(ApiResponse.success("预约已取消", null));
    }

    @PostMapping("/{id}/fulfill")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Hold>> fulfill(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("预约已履约", holdService.fulfillHold(id)));
    }
}