package com.library.controller;

import com.library.dto.request.BookCreateRequest;
import com.library.dto.request.BookUpdateRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.BookDetailResponse;
import com.library.entity.Book;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String language) {
        Map<String, Object> params = new HashMap<>();
        params.put("page", page);
        params.put("limit", limit);
        params.put("keyword", keyword);
        params.put("category", category);
        params.put("campus", campus);
        params.put("language", language);
        return ResponseEntity.ok(ApiResponse.success(bookService.list(params)));
    }

    @GetMapping("/facets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFacets() {
        return ResponseEntity.ok(ApiResponse.success(bookService.getFacets(new HashMap<>())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDetailResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getById(id)));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<Object>> getItems(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getItemsByBookId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Book>> create(@Valid @RequestBody BookCreateRequest data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("图书创建成功", bookService.create(data)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> update(@PathVariable Integer id, @RequestBody BookUpdateRequest data) {
        Map<String, Object> params = new HashMap<>();
        if (data.getTitle() != null) params.put("title", data.getTitle());
        if (data.getAuthor() != null) params.put("author", data.getAuthor());
        if (data.getIsbn() != null) params.put("isbn", data.getIsbn());
        if (data.getPublisher() != null) params.put("publisher", data.getPublisher());
        if (data.getYear() != null) params.put("year", data.getYear());
        if (data.getTotal() != null) params.put("total", data.getTotal());
        if (data.getLocation() != null) params.put("location", data.getLocation());
        if (data.getCover() != null) params.put("cover", data.getCover());
        if (data.getDesc() != null) params.put("desc", data.getDesc());
        if (data.getClcNumber() != null) params.put("clcNumber", data.getClcNumber());
        if (data.getPhysicalDesc() != null) params.put("physicalDesc", data.getPhysicalDesc());
        if (data.getLanguage() != null) params.put("language", data.getLanguage());
        if (data.getCountry() != null) params.put("country", data.getCountry());
        if (data.getCategoryId() != null) params.put("categoryId", data.getCategoryId());
        return ResponseEntity.ok(ApiResponse.success("图书更新成功", bookService.update(id, params)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        bookService.remove(id);
        return ResponseEntity.ok(ApiResponse.success("图书删除成功", null));
    }
}