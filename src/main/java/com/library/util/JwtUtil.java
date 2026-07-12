package com.library.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        // 确保密钥长度至少为 256 位（HS512 算法要求）
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 64) {
            // 如果密钥太短，扩展到足够长度
            byte[] extendedKey = new byte[64];
            System.arraycopy(keyBytes, 0, extendedKey, 0, keyBytes.length);
            // 用密钥本身填充剩余部分
            for (int i = keyBytes.length; i < 64; i++) {
                extendedKey[i] = keyBytes[i % keyBytes.length];
            }
            keyBytes = extendedKey;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(int userId, String role, int tokenVersion) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .claim("tv", tokenVersion)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public int getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Integer.parseInt(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }

    /**
     * 获取 JWT 中的 token_version，兼容旧 token（无 tv 字段时返回 0）
     */
    public int getTokenVersionFromToken(String token) {
        Claims claims = parseToken(token);
        Integer tv = claims.get("tv", Integer.class);
        return tv != null ? tv : 0;
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
