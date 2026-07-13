package com.library.mapper;

import com.library.entity.ErrorLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ErrorLogMapper {
    void insert(ErrorLog errorLog);
    void batchInsert(@Param("logs") List<ErrorLog> logs);
    List<ErrorLog> findAll();
    List<ErrorLog> findByType(@Param("type") String type);
    List<ErrorLog> findByTimeRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    List<ErrorLog> findByUserId(@Param("userId") Integer userId);
    long countByType(@Param("type") String type);
    void deleteByTimeBefore(@Param("time") LocalDateTime time);
}
