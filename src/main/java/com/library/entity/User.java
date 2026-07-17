package com.library.entity;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class User {
    private Integer id;
    private String username;
    @JsonIgnore
    private String password;
    private String name;
    private String role;
    private String phone;
    private String email;
    private BigDecimal totalFines;
    private Integer patronCategoryId;
    private Integer tokenVersion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
