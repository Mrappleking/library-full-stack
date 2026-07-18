package com.library.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ErrorLog {
    private Integer id;
    private String logId;
    private String type;
    private String message;
    private String stack;
    private String url;
    private String method;
    private Integer statusCode;
    private String component;
    private String props;
    private Integer userId;
    private String userRole;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}
