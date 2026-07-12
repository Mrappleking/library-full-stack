package com.library.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookCreateRequest {
    @NotBlank(message = "ISBN不能为空")
    @Size(max = 50, message = "ISBN长度不能超过50个字符")
    private String isbn;
    
    @NotBlank(message = "书名不能为空")
    @Size(max = 255, message = "书名长度不能超过255个字符")
    private String title;
    
    @NotBlank(message = "作者不能为空")
    @Size(max = 255, message = "作者长度不能超过255个字符")
    private String author;
    
    @Size(max = 255, message = "出版社长度不能超过255个字符")
    private String publisher;
    
    @Min(value = 0, message = "出版年份不能为负数")
    private Integer year;
    
    @NotNull(message = "总数量不能为空")
    @Min(value = 1, message = "总数量至少为1")
    private Integer total;
    
    @Size(max = 100, message = "位置长度不能超过100个字符")
    private String location;
    
    @Size(max = 2000, message = "描述长度不能超过2000个字符")
    private String desc;
    
    @Size(max = 50, message = "分类号长度不能超过50个字符")
    private String clcNumber;
    
    @Size(max = 255, message = "形态描述长度不能超过255个字符")
    private String physicalDesc;
    
    @Size(max = 500, message = "封面路径长度不能超过500个字符")
    private String cover;
    
    @Size(max = 50, message = "语言长度不能超过50个字符")
    private String language;
    
    @Size(max = 100, message = "国家长度不能超过100个字符")
    private String country;
    
    private Integer categoryId;
}
