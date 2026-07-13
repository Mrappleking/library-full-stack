package com.library.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ErrorLogRequest {
    private List<LogEntry> logs;

    @Data
    public static class LogEntry {
        private String id;
        private Long timestamp;
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
    }
}
