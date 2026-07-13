package com.library.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.dto.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(0)
public class RateLimitFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    
    @Value("${app.rate-limit.capacity:100}")
    private int capacity;
    
    @Value("${app.rate-limit.refill-tokens:100}")
    private int refillTokens;
    
    @Value("${app.rate-limit.refill-period-seconds:60}")
    private int refillPeriodSeconds;
    
    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        String clientIp = getClientIp(request);
        Bucket bucket = buckets.computeIfAbsent(clientIp, this::createNewBucket);
        
        if (bucket.tryConsume(1)) {
            // 允许通过，继续处理请求
            filterChain.doFilter(request, response);
        } else {
            // 请求过于频繁，返回 429 状态码
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(
                ApiResponse.error(429, "请求过于频繁，请稍后再试")
            ));
        }
    }
    
    private Bucket createNewBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillTokens, Duration.ofSeconds(refillPeriodSeconds))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // 取第一个 IP 地址
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
