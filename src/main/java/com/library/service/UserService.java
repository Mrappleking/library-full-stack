package com.library.service;

import com.library.dto.response.UserProfile;
import com.library.entity.User;
import com.library.exception.AppException;
import com.library.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * 返回所有用户的 UserProfile（不含密码）
     */
    public List<UserProfile> findAll() {
        return userMapper.findAll().stream()
                .map(this::toProfile)
                .collect(Collectors.toList());
    }

    /**
     * 根据 ID 查询用户，返回 UserProfile（不含密码）
     */
    public UserProfile findById(Integer id) {
        User user = userMapper.findById(id);
        if (user == null) throw AppException.notFound("用户不存在");
        return toProfile(user);
    }

    /**
     * 更新用户姓名/手机/邮箱，返回更新后的 UserProfile
     */
    @Transactional
    public UserProfile update(Integer id, String name, String phone, String email) {
        User user = userMapper.findById(id);
        if (user == null) throw AppException.notFound("用户不存在");
        user.setName(name != null ? name : user.getName());
        user.setPhone(phone);
        user.setEmail(email);
        userMapper.update(user);
        return toProfile(user);
    }

    /**
     * 将 User 实体转换为 UserProfile DTO（不含 password）
     */
    private UserProfile toProfile(User user) {
        UserProfile p = new UserProfile();
        p.setId(user.getId());
        p.setUsername(user.getUsername());
        p.setName(user.getName());
        p.setRole(user.getRole());
        p.setPhone(user.getPhone());
        p.setEmail(user.getEmail());
        p.setPatronCategoryId(user.getPatronCategoryId());
        p.setTotalFines(user.getTotalFines() != null ? user.getTotalFines().doubleValue() : 0);
        p.setCreatedAt(user.getCreatedAt());
        return p;
    }
}
