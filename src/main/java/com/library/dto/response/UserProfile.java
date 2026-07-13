package com.library.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfile {
    private Integer id;
    private String username;
    private String name;
    private String role;
    private String phone;
    private String email;
    private Integer patronCategoryId;
    private Double totalFines;
    private LocalDateTime createdAt;
    private List<BorrowRecordResponse> borrowRecords;
}
