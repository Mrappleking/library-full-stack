package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.request.RuleUpsertRequest;
import com.library.dto.response.ApiResponse;
import com.library.entity.CirculationRule;
import com.library.entity.PatronCategory;
import com.library.entity.ItemType;
import com.library.service.RuleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    private final RuleService ruleService;

    public RuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CirculationRule>>> listRules() {
        return ResponseEntity.ok(ApiResponse.success(ruleService.listRules()));
    }

    @GetMapping("/patron-categories")
    public ResponseEntity<ApiResponse<List<PatronCategory>>> listPatronCategories() {
        return ResponseEntity.ok(ApiResponse.success(ruleService.listPatronCategories()));
    }

    @PostMapping("/patron-categories")
    @RequireAdmin
    public ResponseEntity<ApiResponse<PatronCategory>> createPatronCategory(@RequestBody java.util.Map<String, String> body) {
        PatronCategory pc = ruleService.createPatronCategory(body.get("name"));
        return ResponseEntity.status(201).body(ApiResponse.created("读者类型已创建", pc));
    }

    @PutMapping("/patron-categories/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<PatronCategory>> updatePatronCategory(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        PatronCategory pc = ruleService.updatePatronCategory(id, body.get("name"));
        return ResponseEntity.ok(ApiResponse.success("读者类型已更新", pc));
    }

    @DeleteMapping("/patron-categories/{id}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Void>> deletePatronCategory(@PathVariable Integer id) {
        ruleService.deletePatronCategory(id);
        return ResponseEntity.ok(ApiResponse.success("读者类型已删除", null));
    }

    @GetMapping("/item-types")
    public ResponseEntity<ApiResponse<List<ItemType>>> listItemTypes() {
        return ResponseEntity.ok(ApiResponse.success(ruleService.listItemTypes()));
    }

    @PutMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<CirculationRule>> upsert(@Valid @RequestBody RuleUpsertRequest data) {
        CirculationRule rule = new CirculationRule();
        rule.setPatronCategoryId(data.getPatronCategoryId());
        rule.setItemTypeId(data.getItemTypeId());
        rule.setMaxBorrows(data.getMaxBorrows());
        rule.setLoanDays(data.getLoanDays());
        rule.setRenewals(data.getRenewals());
        rule.setRenewalDays(data.getRenewalDays());
        rule.setFinePerDay(data.getFinePerDay());
        rule = ruleService.upsertRule(rule);
        return ResponseEntity.ok(ApiResponse.success("规则已更新", rule));
    }
}