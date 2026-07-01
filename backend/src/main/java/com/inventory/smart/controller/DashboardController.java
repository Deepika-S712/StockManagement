package com.inventory.smart.controller;

import com.inventory.smart.dto.DashboardDto;
import com.inventory.smart.service.SmartInventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private SmartInventoryService smartInventoryService;

    @GetMapping
    public ResponseEntity<DashboardDto.DashboardStats> getDashboardStats(@RequestParam(required = false, defaultValue = "10") Integer minStockLevel) {
        return ResponseEntity.ok(smartInventoryService.getDashboardStats(minStockLevel));
    }
}
