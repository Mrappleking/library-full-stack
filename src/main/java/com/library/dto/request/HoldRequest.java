package com.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoldRequest {
    @NotNull(message = "图书ID不能为空")
    private Integer bookId;
}