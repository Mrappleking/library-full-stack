package com.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码至少6位")
    private String password;

    @NotBlank(message = "请确认密码")
    private String confirmPassword;

    @NotBlank(message = "姓名不能为空")
    private String name;

    @Pattern(regexp = "^(1[3-9]\\d{9})?$", message = "手机号格式无效")
    private String phone;
    private String email;
}
