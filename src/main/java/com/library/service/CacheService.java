package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private static final int SCAN_BATCH_SIZE = 1000;

    public CacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void set(@NonNull String key, @NonNull Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.debug("Redis set failed, skipping: {}", e.getMessage());
        }
    }

    public void set(@NonNull String key, @NonNull Object value, long timeout, @NonNull TimeUnit unit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
        } catch (Exception e) {
            log.debug("Redis set with timeout failed, skipping: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public <T> T get(@NonNull String key) {
        try {
            return (T) redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.debug("Redis get failed, returning null: {}", e.getMessage());
            return null;
        }
    }

    public boolean exists(@NonNull String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.debug("Redis exists failed, returning false: {}", e.getMessage());
            return false;
        }
    }

    public void delete(@NonNull String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.debug("Redis delete failed, skipping: {}", e.getMessage());
        }
    }

    public void deletePattern(@NonNull String pattern) {
        try {
            List<String> keys = scanKeys(pattern);
            if (!keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.debug("Redis deletePattern failed, skipping: {}", e.getMessage());
        }
    }

    @SuppressWarnings("deprecation")
    private List<String> scanKeys(@NonNull String pattern) {
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
        try {
            redisTemplate.opsForValue().increment(key);
        } catch (Exception e) {
            log.debug("Redis increment failed, skipping: {}", e.getMessage());
        }
    }

    public void decrement(@NonNull String key) {
        try {
            redisTemplate.opsForValue().decrement(key);
        } catch (Exception e) {
            log.debug("Redis decrement failed, skipping: {}", e.getMessage());
        }
    }

    public void expire(@NonNull String key, long timeout, @NonNull TimeUnit unit) {
        try {
            redisTemplate.expire(key, timeout, unit);
        } catch (Exception e) {
            log.debug("Redis expire failed, skipping: {}", e.getMessage());
        }
    }
}