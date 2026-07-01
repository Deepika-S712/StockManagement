package com.inventory.smart.service;

import com.inventory.smart.model.Product;
import com.inventory.smart.model.Sales;
import com.inventory.smart.model.StockHistory;
import com.inventory.smart.repository.ProductRepository;
import com.inventory.smart.repository.SalesRepository;
import com.inventory.smart.repository.StockHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SalesService {

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockHistoryRepository stockHistoryRepository;

    public List<Sales> getAllSales() {
        return salesRepository.findAll();
    }

    @Transactional
    public Sales recordSales(Sales sales) {
        Product product = productRepository.findById(sales.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() < sales.getQuantitySold()) {
            throw new RuntimeException("Insufficient stock");
        }

        // Reduce stock
        product.setQuantity(product.getQuantity() - sales.getQuantitySold());
        productRepository.save(product);

        // Record stock history
        StockHistory history = new StockHistory();
        history.setProduct(product);
        history.setChangeType("REDUCE");
        history.setQuantity(sales.getQuantitySold());
        stockHistoryRepository.save(history);

        // Save sales
        sales.setProduct(product);
        return salesRepository.save(sales);
    }
}
