package com.library.controller;

import com.library.dto.request.CategoryCreateRequest;
import com.library.dto.request.CategoryUpdateRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.CategoryResponse;
import com.library.entity.Category;
import com.library.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> create(@Valid @RequestBody CategoryCreateRequest data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("分类创建成功", categoryService.create(data.getName(), data.getDesc())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> update(@PathVariable Integer id, @Valid @RequestBody CategoryUpdateRequest data) {
        return ResponseEntity.ok(ApiResponse.success("分类更新成功", categoryService.update(id, data.getName(), data.getDesc())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("分类删除成功", null));
    }
}