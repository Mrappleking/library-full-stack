package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.request.BorrowRequest;
import com.library.dto.response.ApiResponse;
import com.library.entity.BorrowRecord;
import com.library.service.BorrowService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyBorrows(HttpServletRequest request,
                                           @RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "20") int limit) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.success(borrowService.getMyBorrows(userId, page, limit)));
    }

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<Map<String, Object>>> listBorrows(
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "20") int limit,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(required = false) Integer categoryId,
                                          @RequestParam(required = false) String export,
                                          HttpServletResponse response) {
        if ("csv".equals(export)) {
            borrowService.exportCsv(null, response);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(ApiResponse.success(borrowService.listBorrows(page, limit, search, status, categoryId)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHistory(HttpServletRequest request,
                                         @RequestParam(defaultValue = "1") int page,
                                         @RequestParam(defaultValue = "20") int limit,
                                         @RequestParam(required = false) String export,
                                         HttpServletResponse response) {
        Integer userId = (Integer) request.getAttribute("userId");
        if ("csv".equals(export)) {
            borrowService.exportCsv(userId, response);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(ApiResponse.success(borrowService.getHistory(userId, page, limit)));
    }

    @PostMapping("/borrow")
    public ResponseEntity<ApiResponse<BorrowRecord>> borrow(HttpServletRequest request, @Valid @RequestBody BorrowRequest params) {
        Integer userId = (Integer) request.getAttribute("userId");
        BorrowRecord record = borrowService.borrow(userId, params);
        return ResponseEntity.status(201).body(ApiResponse.created(record));
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<ApiResponse<BorrowRecord>> returnBook(@PathVariable Integer id, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("userRole");
        boolean isAdmin = "admin".equals(role);
        return ResponseEntity.ok(ApiResponse.success(borrowService.returnBook(id, userId, isAdmin)));
    }

    @PostMapping("/renew/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> renew(@PathVariable Integer id, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(ApiResponse.success(borrowService.renew(id, userId)));
    }
}