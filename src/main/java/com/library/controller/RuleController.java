package com.library.controller;

import com.library.dto.request.RuleUpsertRequest;
import com.library.dto.response.ApiResponse;
import com.library.entity.CirculationRule;
import com.library.entity.PatronCategory;
import com.library.entity.ItemType;
import com.library.mapper.PatronCategoryMapper;
import com.library.mapper.ItemTypeMapper;
import com.library.mapper.CirculationRuleMapper;
import com.library.service.RuleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    private final PatronCategoryMapper patronCategoryMapper;
    private final ItemTypeMapper itemTypeMapper;
    private final CirculationRuleMapper ruleMapper;
    private final RuleService ruleService;

    public RuleController(PatronCategoryMapper patronCategoryMapper, ItemTypeMapper itemTypeMapper, CirculationRuleMapper ruleMapper, RuleService ruleService) {
        this.patronCategoryMapper = patronCategoryMapper;
        this.itemTypeMapper = itemTypeMapper;
        this.ruleMapper = ruleMapper;
        this.ruleService = ruleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CirculationRule>>> listRules() {
        return ResponseEntity.ok(ApiResponse.success(ruleMapper.findAll()));
    }

    @GetMapping("/patron-categories")
    public ResponseEntity<ApiResponse<List<PatronCategory>>> listPatronCategories() {
        return ResponseEntity.ok(ApiResponse.success(patronCategoryMapper.findAll()));
    }

    @GetMapping("/item-types")
    public ResponseEntity<ApiResponse<List<ItemType>>> listItemTypes() {
        return ResponseEntity.ok(ApiResponse.success(itemTypeMapper.findAll()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<CirculationRule>> upsert(@Valid @RequestBody RuleUpsertRequest data) {
        CirculationRule rule = new CirculationRule();
        rule.setPatronCategoryId(data.getPatronCategoryId());
        rule.setItemTypeId(data.getItemTypeId());
        rule.setMaxBorrows(data.getMaxBorrows());
        rule.setLoanDays(data.getLoanDays());
        rule.setRenewals(data.getRenewals());
        rule.setRenewalDays(data.getRenewalDays());
        rule.setFinePerDay(data.getFinePerDay());
        ruleMapper.upsert(rule);
        ruleService.invalidateCache();
        return ResponseEntity.ok(ApiResponse.success("规则已更新", rule));
    }
}