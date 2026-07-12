package com.library.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ReaderUpdateRequest {
    private String name;
    @Pattern(regexp = "^(1[3-9]\\d{9})?$", message = "手机号格式无效")
    private String phone;
    private String email;
}
