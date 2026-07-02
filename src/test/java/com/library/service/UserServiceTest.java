package com.library.service;

import com.library.dto.response.UserProfile;
import com.library.entity.User;
import com.library.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest extends AbstractServiceTest {

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userMapper);
    }

    @Test
    void findAll_shouldReturnAllUsers() {
        User user1 = createUser(1, "admin", "系统管理员", "admin");
        User user2 = createUser(2, "reader1", "张三", "reader");
        when(userMapper.findAll()).thenReturn(List.of(user1, user2));

        List<UserProfile> result = userService.findAll();

        assertEquals(2, result.size());
        assertEquals("admin", result.get(0).getUsername());
        assertEquals("reader1", result.get(1).getUsername());
        verify(userMapper).findAll();
    }

    @Test
    void findById_shouldReturnProfile() {
        User user = createUser(1, "admin", "系统管理员", "admin");
        user.setPhone("13800000000");
        user.setEmail("admin@library.com");
        user.setPatronCategoryId(1);
        user.setTotalFines(BigDecimal.valueOf(10.50));
        when(userMapper.findById(1)).thenReturn(user);

        UserProfile result = userService.findById(1);

        assertEquals(1, result.getId());
        assertEquals("admin", result.getUsername());
        assertEquals("系统管理员", result.getName());
        assertEquals("admin", result.getRole());
        assertEquals("13800000000", result.getPhone());
        assertEquals("admin@library.com", result.getEmail());
        assertEquals(1, result.getPatronCategoryId());
        assertEquals(10.50, result.getTotalFines());
    }

    @Test
    void findById_shouldThrowWhenNotFound() {
        when(userMapper.findById(999)).thenReturn(null);

        AppException ex = assertThrows(AppException.class, () -> userService.findById(999));
        assertEquals("用户不存在", ex.getMessage());
    }

    @Test
    void update_shouldUpdateFields() {
        User existing = createUser(1, "reader1", "旧名字", "reader");
        existing.setPhone("13800000000");
        existing.setEmail("old@test.com");
        when(userMapper.findById(1)).thenReturn(existing);

        UserProfile result = userService.update(1, "新名字", "13900000001", "new@test.com");

        assertEquals("新名字", result.getName());
        assertEquals("13900000001", result.getPhone());
        assertEquals("new@test.com", result.getEmail());
        verify(userMapper).update(any(User.class));
    }

    @Test
    void update_shouldKeepNameWhenNull() {
        User existing = createUser(1, "reader1", "张三", "reader");
        existing.setPhone("13800000000");
        when(userMapper.findById(1)).thenReturn(existing);

        UserProfile result = userService.update(1, null, "13900000001", "new@test.com");

        assertEquals("张三", result.getName());
        assertEquals("13900000001", result.getPhone());
        assertEquals("new@test.com", result.getEmail());
        verify(userMapper).update(any(User.class));
    }

    @Test
    void update_shouldThrowWhenNotFound() {
        when(userMapper.findById(999)).thenReturn(null);

        AppException ex = assertThrows(AppException.class,
                () -> userService.update(999, "新名字", "13900000001", "new@test.com"));
        assertEquals("用户不存在", ex.getMessage());
        verify(userMapper, never()).update(any());
    }

    /**
     * Helper — 构造 User 对象
     */
    private User createUser(Integer id, String username, String name, String role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setPassword("$2a$10$hashedpassword");
        user.setName(name);
        user.setRole(role);
        user.setTotalFines(BigDecimal.ZERO);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }
}
