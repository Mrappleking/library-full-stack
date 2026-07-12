package com.library.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50个字符之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @NotBlank(message = "请确认密码")
    private String confirmPassword;

    @NotBlank(message = "姓名不能为空")
    @Size(max = 100, message = "姓名长度不能超过100个字符")
    private String name;

    @Pattern(regexp = "^(1[3-9]\\d{9})?$", message = "手机号格式无效")
    private String phone;
    
    @Email(message = "邮箱格式无效")
    private String email;
}
