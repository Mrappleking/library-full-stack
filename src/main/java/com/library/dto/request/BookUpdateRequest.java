package com.library.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookUpdateRequest {
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private Integer year;
    private Integer total;
    private String location;
    private String cover;
    private String desc;
    private String clcNumber;
    private String physicalDesc;
    private String language;
    private String country;
    private Integer categoryId;
}