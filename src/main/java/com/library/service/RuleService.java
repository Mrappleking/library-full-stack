package com.library.service;

import com.library.entity.CirculationRule;
import com.library.entity.ItemType;
import com.library.entity.PatronCategory;
import com.library.exception.AppException;
import com.library.mapper.CirculationRuleMapper;
import com.library.mapper.ItemTypeMapper;
import com.library.mapper.PatronCategoryMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class RuleService {

    private final CirculationRuleMapper ruleMapper;
    private final PatronCategoryMapper patronCategoryMapper;
    private final ItemTypeMapper itemTypeMapper;
    private final CacheService cacheService;

    private static final String RULE_CACHE_PREFIX = "rule:";
    
    @Value("${app.cache.rule-ttl-seconds:3600}")
    private int ruleCacheTtlSeconds;

    public RuleService(CirculationRuleMapper ruleMapper, PatronCategoryMapper patronCategoryMapper,
                       ItemTypeMapper itemTypeMapper, CacheService cacheService) {
        this.ruleMapper = ruleMapper;
        this.patronCategoryMapper = patronCategoryMapper;
        this.itemTypeMapper = itemTypeMapper;
        this.cacheService = cacheService;
    }

    public List<CirculationRule> listRules() {
        return ruleMapper.findAll();
    }

    public List<PatronCategory> listPatronCategories() {
        return patronCategoryMapper.findAll();
    }

    public PatronCategory createPatronCategory(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw AppException.badRequest("名称不能为空");
        }
        PatronCategory pc = new PatronCategory();
        pc.setName(name.trim());
        patronCategoryMapper.insert(pc);
        return pc;
    }

    public PatronCategory updatePatronCategory(Integer id, String name) {
        PatronCategory pc = patronCategoryMapper.findById(id);
        if (pc == null) {
            throw AppException.notFound("读者类型不存在");
        }
        if (name == null || name.trim().isEmpty()) {
            throw AppException.badRequest("名称不能为空");
        }
        pc.setName(name.trim());
        patronCategoryMapper.update(pc);
        return pc;
    }

    public void deletePatronCategory(Integer id) {
        PatronCategory pc = patronCategoryMapper.findById(id);
        if (pc == null) {
            throw AppException.notFound("读者类型不存在");
        }
        long userCount = patronCategoryMapper.countUsersByPatronCategoryId(id);
        if (userCount > 0) {
            throw AppException.conflict("该读者类型下有用户，无法删除");
        }
        long ruleCount = patronCategoryMapper.countRulesByPatronCategoryId(id);
        if (ruleCount > 0) {
            throw AppException.conflict("该读者类型关联借阅规则，无法删除");
        }
        patronCategoryMapper.deleteById(id);
    }

    public List<ItemType> listItemTypes() {
        return itemTypeMapper.findAll();
    }

    public CirculationRule upsertRule(CirculationRule rule) {
        ruleMapper.upsert(rule);
        invalidateCache();
        return rule;
    }

    /**
     * Get the applicable circulation rule for a given patron + item type combination.
     * Falls back: specific rule → default rule → hardcoded defaults.
     */
    public CirculationRule getRule(Integer patronCategoryId, Integer itemTypeId) {
        String cacheKey = RULE_CACHE_PREFIX + (patronCategoryId != null ? patronCategoryId : "null") + ":" + (itemTypeId != null ? itemTypeId : "null");
        CirculationRule cached = cacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        CirculationRule rule = null;
        if (patronCategoryId != null && itemTypeId != null) {
            rule = ruleMapper.findByPatronAndItemType(patronCategoryId, itemTypeId);
        }

        if (rule == null) {
            rule = ruleMapper.findDefault();
        }

        if (rule == null) {
            rule = new CirculationRule();
            rule.setMaxBorrows(5);
            rule.setLoanDays(30);
            rule.setRenewals(1);
            rule.setRenewalDays(15);
            rule.setFinePerDay(java.math.BigDecimal.valueOf(0.10));
        }

        cacheService.set(cacheKey, rule, ruleCacheTtlSeconds, TimeUnit.SECONDS);
        return rule;
    }

    public void invalidateCache() {
        cacheService.deletePattern(RULE_CACHE_PREFIX + "*");
    }
}
