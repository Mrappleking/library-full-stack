package com.library.config;

import com.library.entity.User;
import com.library.mapper.UserMapper;
import com.library.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public JwtAuthFilter(JwtUtil jwtUtil, UserMapper userMapper) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Fully public paths — any HTTP method allowed without auth
        if (isPublicPath(path)) {
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
            User user = userMapper.findById(userId);
            int currentVersion = user != null && user.getTokenVersion() != null ? user.getTokenVersion() : 0;
            if (user == null || currentVersion != tokenVersion) {
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
        response.getWriter().write("{\"code\":" + status + ",\"message\":\"" + message + "\",\"data\":null,\"timestamp\":\"" + java.time.LocalDateTime.now().toString() + "\"}");
    }

    /**
     * Fully public paths — completely open, all HTTP methods.
     */
    private boolean isPublicPath(String path) {
        return path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/health")
                || path.equals("/")
                || path.startsWith("/covers")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/api-docs")
                || path.startsWith("/v3/api-docs");
    }

    /**
     * Read-only public paths — GET/HEAD allowed without auth.
     * POST/PUT/DELETE on these paths require authentication.
     */
    private boolean isReadOnlyPublicPath(String path) {
        return path.equals("/api/facets")
                || path.startsWith("/api/books")
                || path.startsWith("/api/categories")
                || path.startsWith("/api/rules")
                || path.startsWith("/api/holds/count");
    }
}
