package com.inventory.smart.controller;

import com.inventory.smart.model.StockHistory;
import com.inventory.smart.repository.StockHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock-history")
public class StockHistoryController {

    @Autowired
    private StockHistoryRepository stockHistoryRepository;

    @GetMapping
    public List<StockHistory> getStockHistory() {
        return stockHistoryRepository.findAllByOrderByDateDesc();
    }
}
