package com.library.controller; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import java.util.Map;
@RestController
public class SystemController {
    @Autowired
     private RequestMappingHandlerMapping handlerMapping;
    @GetMapping("/api/system/info")
    public ResponseEntity<Map<String, Object>> systemInfo() {
        int apicount=handlerMapping.getHandlerMethods().size();
        return ResponseEntity.ok(Map.of("api", "Library Management API", "endpoints", apicount));
    }
}
