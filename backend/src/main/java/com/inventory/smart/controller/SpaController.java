package com.inventory.smart.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping("/")
    public String redirectRoot() {
        return "redirect:/StockManagement/";
    }

    @GetMapping({
        "/StockManagement",
        "/StockManagement/",
        "/StockManagement/login",
        "/StockManagement/products",
        "/StockManagement/suppliers",
        "/StockManagement/sales",
        "/StockManagement/history"
    })
    public String forwardSpa() {
        return "forward:/StockManagement/index.html";
    }
}
