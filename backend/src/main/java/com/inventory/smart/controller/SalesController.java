package com.inventory.smart.controller;

import com.inventory.smart.model.Sales;
import com.inventory.smart.service.SalesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

    @Autowired
    private SalesService salesService;

    @GetMapping
    public List<Sales> getAllSales() {
        return salesService.getAllSales();
    }

    @PostMapping
    public ResponseEntity<Sales> recordSales(@RequestBody Sales sales) {
        try {
            return ResponseEntity.ok(salesService.recordSales(sales));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
