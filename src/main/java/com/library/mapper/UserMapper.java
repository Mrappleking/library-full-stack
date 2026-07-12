package com.library.mapper;

import com.library.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {
    User findById(Integer id);
    User findByUsername(String username);
    List<User> findAll();
    void insert(User user);
    void update(User user);
    void addFine(@Param("userId") Integer userId, @Param("amount") java.math.BigDecimal amount);
    void updatePassword(User user);
    void incrementTokenVersion(@Param("userId") Integer userId);
    List<User> findPage(@Param("offset") int offset, @Param("limit") int limit);
    List<User> searchReaders(@Param("keyword") String keyword,
                             @Param("patronCategoryId") Integer patronCategoryId,
                             @Param("offset") int offset,
                             @Param("limit") int limit,
                             @Param("sortBy") String sortBy,
                             @Param("sortDir") String sortDir);
    long countSearchReaders(@Param("keyword") String keyword,
                            @Param("patronCategoryId") Integer patronCategoryId);
    long countReaders();
    long count();
    void deleteById(Integer id);
}