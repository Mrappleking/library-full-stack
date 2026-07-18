package com.library.config;

import com.library.service.MonitorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class MonitorInterceptor implements HandlerInterceptor {

    private final MonitorService monitorService;

    public MonitorInterceptor(MonitorService monitorService) {
        this.monitorService = monitorService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute("_startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Long startTime = (Long) request.getAttribute("_startTime");
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            String endpoint = request.getRequestURI();
            String method = request.getMethod();
            int statusCode = response.getStatus();

            monitorService.recordApiCall(endpoint, method, duration, statusCode);
        }
    }
}
