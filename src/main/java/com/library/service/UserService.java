package com.library.service;

import com.library.dto.response.BookRef;
import com.library.dto.response.BorrowRecordResponse;
import com.library.dto.response.UserProfile;
import com.library.entity.BorrowRecord;
import com.library.entity.User;
import com.library.exception.AppException;
import com.library.mapper.BorrowRecordMapper;
import com.library.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final BorrowRecordMapper borrowRecordMapper;

    public UserService(UserMapper userMapper, BorrowRecordMapper borrowRecordMapper) {
        this.userMapper = userMapper;
        this.borrowRecordMapper = borrowRecordMapper;
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
     * 根据 ID 查询用户，返回 UserProfile（不含密码），包含借阅记录
     */
    public UserProfile findById(Integer id) {
        User user = userMapper.findById(id);
        if (user == null) throw AppException.notFound("用户不存在");
        UserProfile profile = toProfile(user);
        List<BorrowRecord> records = borrowRecordMapper.findByUserId(id);
        profile.setBorrowRecords(records.stream().map(this::toBorrowRecordResponse).collect(Collectors.toList()));
        return profile;
    }

    /**
     * 更新用户姓名/手机/邮箱，返回更新后的 UserProfile
     */
    @Transactional
    public UserProfile update(Integer id, String name, String phone, String email) {
        User user = userMapper.findById(id);
        if (user == null) throw AppException.notFound("用户不存在");
        user.setName(name != null ? name : user.getName());
        user.setPhone(phone != null ? phone : user.getPhone());
        user.setEmail(email != null ? email : user.getEmail());
        userMapper.update(user);
        return toProfile(user);
    }

    /**
     * 分页搜索读者，支持关键词搜索、读者类型筛选和排序
     */
    public Map<String, Object> searchReaders(String keyword, Integer patronCategoryId,
                                              int page, int limit,
                                              String sortBy, String sortDir) {
        int offset = (page - 1) * limit;
        List<User> users = userMapper.searchReaders(keyword, patronCategoryId, offset, limit, sortBy, sortDir);
        long total = userMapper.countSearchReaders(keyword, patronCategoryId);
        List<UserProfile> profiles = users.stream().map(this::toProfile).collect(Collectors.toList());
        int pages = (int) Math.ceil((double) total / limit);

        Map<String, Object> result = new HashMap<>();
        result.put("data", profiles);
        result.put("total", total);
        result.put("page", page);
        result.put("limit", limit);
        result.put("pages", pages);
        return result;
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

    /**
     * 将 BorrowRecord 实体转换为 BorrowRecordResponse DTO
     */
    private BorrowRecordResponse toBorrowRecordResponse(BorrowRecord record) {
        BorrowRecordResponse r = new BorrowRecordResponse();
        r.setId(record.getId());
        r.setUserId(record.getUserId());
        r.setBookId(record.getBookId());
        r.setBookItemId(record.getBookItemId());
        r.setBorrowDate(record.getBorrowDate());
        r.setDueDate(record.getDueDate());
        r.setReturnDate(record.getReturnDate());
        r.setStatus(record.getStatus());
        r.setRenewed(record.getRenewed());
        if (record.getBook() != null) {
            BookRef book = new BookRef(record.getBook().getId(), record.getBook().getTitle(),
                    record.getBook().getAuthor(), record.getBook().getIsbn());
            r.setBook(book);
        }
        return r;
    }
}
