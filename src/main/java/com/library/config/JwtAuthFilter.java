package com.library.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.dto.response.ApiResponse;
import com.library.entity.User;
import com.library.mapper.UserMapper;
import com.library.service.CacheService;
import com.library.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Order(1)
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private static final String USER_CACHE_PREFIX = "user:";

    @Value("${app.cache.user-ttl-seconds:300}")
    private int userCacheTtlSeconds;
    
    @Value("${app.security.public-paths:/api/auth/login,/api/auth/register,/api/health}")
    private List<String> publicPaths;
    
    @Value("${app.security.reader-public-paths:/api/facets,/api/books,/api/categories,/api/rules,/api/holds/count}")
    private List<String> readerPublicPaths;

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    private final CacheService cacheService;

    public JwtAuthFilter(JwtUtil jwtUtil, UserMapper userMapper, ObjectMapper objectMapper, CacheService cacheService) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.objectMapper = objectMapper;
        this.cacheService = cacheService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Fully public paths — any HTTP method allowed without auth
        if (isPublicPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        // 1.5. POST /api/system/logs is public for error reporting
        if ("/api/system/logs".equals(path) && "POST".equals(method)) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Read-only public paths — only GET/HEAD allowed without auth
        if (isReadOnlyPublicPath(path) && ("GET".equals(method) || "HEAD".equals(method))) {
            chain.doFilter(request, response);
            return;
        }

        // 3. All other paths (including write operations on read-only paths) require auth
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeError(response, 401, "未登录或Token无效");
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            writeError(response, 401, "Token无效或已过期");
            return;
        }

        int userId = jwtUtil.getUserIdFromToken(token);
        int tokenVersion = jwtUtil.getTokenVersionFromToken(token);

        // Check token version — reject if user has been logged out / force-logged-out
        // 兼容旧数据库（无 token_version 列时视为 0）
        try {
            Integer currentVersion = getUserTokenVersion(userId);
            if (currentVersion == null || currentVersion != tokenVersion) {
                writeError(response, 401, "Token已被注销");
                return;
            }
        } catch (Exception e) {
            log.error("用户认证查询失败: userId={}", userId, e);
            writeError(response, 500, "服务器内部错误");
            return;
        }

        // Set user info in request attributes
        request.setAttribute("userId", userId);
        request.setAttribute("userRole", jwtUtil.getRoleFromToken(token));
        chain.doFilter(request, response);
    }

    /**
     * Write JSON error response with the given status code and Chinese error message.
     */
    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(status, message)));
    }

    /**
     * Fully public paths — completely open, all HTTP methods.
     */
    private boolean isPublicPath(String path) {
        if (path.equals("/") || path.startsWith("/covers") 
                || path.startsWith("/swagger-ui") || path.startsWith("/api-docs") 
                || path.startsWith("/v3/api-docs")) {
            return true;
        }
        return publicPaths.stream().anyMatch(p -> path.equals(p));
    }

    /**
     * Read-only public paths — GET/HEAD allowed without auth.
     * POST/PUT/DELETE on these paths require authentication.
     */
    private boolean isReadOnlyPublicPath(String path) {
        return readerPublicPaths.stream().anyMatch(p -> path.equals(p) || path.startsWith(p));
    }

    /**
     * Get user token version from cache, fallback to database.
     */
    private Integer getUserTokenVersion(int userId) {
        String cacheKey = USER_CACHE_PREFIX + userId;
        try {
            Integer cachedVersion = cacheService.get(cacheKey);
            if (cachedVersion != null) {
                return cachedVersion;
            }
        } catch (Exception e) {
            log.debug("Redis cache unavailable, falling back to database: {}", e.getMessage());
        }
        User user = userMapper.findById(userId);
        if (user == null) {
            return null;
        }
        int version = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
        try {
            cacheService.set(cacheKey, version, userCacheTtlSeconds, java.util.concurrent.TimeUnit.SECONDS);
        } catch (Exception e) {
            log.debug("Failed to set cache: {}", e.getMessage());
        }
        return version;
    }
}
