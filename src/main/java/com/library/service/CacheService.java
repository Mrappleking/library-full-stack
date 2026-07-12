package com.library.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public CacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void set(@NonNull String key, @NonNull Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public void set(@NonNull String key, @NonNull Object value, long timeout, @NonNull TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(@NonNull String key) {
        return (T) redisTemplate.opsForValue().get(key);
    }

    public boolean exists(@NonNull String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void delete(@NonNull String key) {
        redisTemplate.delete(key);
    }

    public void deletePattern(@NonNull String pattern) {
        var keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    public void increment(@NonNull String key) {
        redisTemplate.opsForValue().increment(key);
    }

    public void decrement(@NonNull String key) {
        redisTemplate.opsForValue().decrement(key);
    }

    public void expire(@NonNull String key, long timeout, @NonNull TimeUnit unit) {
        redisTemplate.expire(key, timeout, unit);
    }
}