package com.library.service;

import com.library.entity.CirculationRule;
import com.library.mapper.CirculationRuleMapper;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RuleService {

    private final CirculationRuleMapper ruleMapper;
    private final CacheService cacheService;

    private static final String RULE_CACHE_PREFIX = "rule:";
    private static final int RULE_CACHE_TTL_SECONDS = 3600;

    public RuleService(CirculationRuleMapper ruleMapper, CacheService cacheService) {
        this.ruleMapper = ruleMapper;
        this.cacheService = cacheService;
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

        cacheService.set(cacheKey, rule, RULE_CACHE_TTL_SECONDS, TimeUnit.SECONDS);
        return rule;
    }

    public void invalidateCache() {
        cacheService.deletePattern(RULE_CACHE_PREFIX + "*");
    }
}
