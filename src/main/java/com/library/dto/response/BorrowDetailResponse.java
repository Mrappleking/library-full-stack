package com.library.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorrowDetailResponse {
    private Integer id;
    private Integer userId;
    private String userName;
    private Integer bookId;
    private String bookTitle;
    private String bookCover;
    private Integer bookItemId;
    private String barcode;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private String status;
    private Boolean renewed;
    private Integer patronCategoryId;
    private Integer itemTypeId;
}