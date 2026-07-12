package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.entity.Fine;
import com.library.service.FineService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Fine>>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String paid) {
        Boolean paidBoolean = paid != null ? "true".equalsIgnoreCase(paid) : null;
        return ResponseEntity.ok(ApiResponse.success(fineService.findAll(type, paidBoolean)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Fine>>> getMyFines(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.success(fineService.findByUserId(userId)));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Fine>> payFine(@PathVariable Integer id, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String userRole = (String) request.getAttribute("userRole");
        return ResponseEntity.ok(ApiResponse.success("罚款已支付", fineService.markPaid(id, userId, userRole)));
    }
}