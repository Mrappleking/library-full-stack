package com.library.aspect;

import com.library.exception.AppException;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AdminAspect {

    @Pointcut("@annotation(com.library.annotation.RequireAdmin)")
    public void requireAdmin() {}

    @Around("requireAdmin()")
    public Object checkAdmin(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getRequest();
        if (request == null) {
            throw AppException.forbidden("请先登录");
        }
        
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            throw AppException.forbidden("仅管理员可访问");
        }
        
        return joinPoint.proceed();
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}