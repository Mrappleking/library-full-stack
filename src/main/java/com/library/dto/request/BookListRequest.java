package com.library.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookListRequest {
    private Integer page;
    private Integer limit;
    private String search;
    private Integer categoryId;
    private String language;
    private Integer yearMin;
    private Integer yearMax;
    private String campus;
    private String location;
    private String sortBy;
    private String sortOrder;
}