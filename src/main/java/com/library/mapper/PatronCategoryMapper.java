package com.library.mapper;

import com.library.entity.PatronCategory;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PatronCategoryMapper {
    @Select("SELECT * FROM patron_categories WHERE id = #{id}")
    PatronCategory findById(Integer id);

    @Select("SELECT * FROM patron_categories ORDER BY name")
    List<PatronCategory> findAll();

    @Insert("INSERT INTO patron_categories(name, created_at) VALUES(#{name}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(PatronCategory patronCategory);

    @Update("UPDATE patron_categories SET name=#{name} WHERE id=#{id}")
    void update(PatronCategory patronCategory);

    @Delete("DELETE FROM patron_categories WHERE id=#{id}")
    void deleteById(Integer id);

    @Select("SELECT COUNT(*) FROM users WHERE patronCategoryId = #{patronCategoryId}")
    long countUsersByPatronCategoryId(Integer patronCategoryId);

    @Select("SELECT COUNT(*) FROM circulation_rules WHERE patronCategoryId = #{patronCategoryId}")
    long countRulesByPatronCategoryId(Integer patronCategoryId);
}
