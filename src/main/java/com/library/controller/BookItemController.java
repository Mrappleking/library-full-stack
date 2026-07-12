package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/book-items")
public class BookItemController {

    private final BookService bookService;

    public BookItemController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/{barcode}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> lookupByBarcode(@PathVariable String barcode) {
        Map<String, Object> result = bookService.lookupByBarcode(barcode);
        if (result == null) {
            return ResponseEntity.status(404).body(ApiResponse.notFound("未找到馆藏复本"));
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}