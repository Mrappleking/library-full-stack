package com.library.service;

import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final int SCAN_BATCH_SIZE = 1000;

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
        List<String> keys = scanKeys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private List<String> scanKeys(String pattern) {
        return redisTemplate.execute((RedisCallback<List<String>>) connection -> {
            List<String> keys = new ArrayList<>();
            var options = org.springframework.data.redis.core.ScanOptions.scanOptions()
                    .match(pattern)
                    .count(SCAN_BATCH_SIZE)
                    .build();
            try (var cursor = connection.scan(options)) {
                while (cursor.hasNext()) {
                    byte[] keyBytes = cursor.next();
                    String key = redisTemplate.getStringSerializer().deserialize(keyBytes);
                    if (key != null) {
                        keys.add(key);
                    }
                }
            }
            return keys;
        });
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