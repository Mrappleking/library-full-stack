package com.library.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageDataResponse<T> {
    private List<T> list;
    private Long total;
    private Integer page;
    private Integer limit;

    public static <T> PageDataResponse<T> of(List<T> list, Long total, Integer page, Integer limit) {
        return new PageDataResponse<>(list, total, page, limit);
    }
}