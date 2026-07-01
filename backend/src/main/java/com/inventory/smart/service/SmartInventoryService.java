package com.inventory.smart.service;

import com.inventory.smart.dto.DashboardDto;
import com.inventory.smart.model.Product;
import com.inventory.smart.model.Sales;
import com.inventory.smart.model.Supplier;
import com.inventory.smart.repository.ProductRepository;
import com.inventory.smart.repository.SalesRepository;
import com.inventory.smart.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmartInventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public DashboardDto.DashboardStats getDashboardStats(int minStockLevel) {
        DashboardDto.DashboardStats stats = new DashboardDto.DashboardStats();
        
        List<Product> allProducts = productRepository.findAll();
        List<Sales> allSales = salesRepository.findAll();
        List<Supplier> allSuppliers = supplierRepository.findAll();

        stats.setTotalProducts(allProducts.size());
        stats.setTotalSales(allSales.stream().mapToInt(Sales::getQuantitySold).sum());
        
        // Low Stock Alert (threshold < minStockLevel)
        stats.setLowStockItems(productRepository.findByQuantityLessThan(minStockLevel));

        // Auto-Reorder Prediction System
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<DashboardDto.ReorderAlert> reorderAlerts = new ArrayList<>();

        for (Product product : allProducts) {
            List<Sales> recentSales = salesRepository.findByProductId(product.getId()).stream()
                    .filter(s -> s.getDate().isAfter(thirtyDaysAgo))
                    .collect(Collectors.toList());

            int totalSold = recentSales.stream().mapToInt(Sales::getQuantitySold).sum();
            double averageDailySales = totalSold / 30.0;
            
            if (averageDailySales > 0) {
                int leadTime = (product.getSupplier() != null && product.getSupplier().getDeliveryTime() != null) 
                                ? product.getSupplier().getDeliveryTime() : 7;
                
                int reorderPoint = (int) Math.ceil(averageDailySales * leadTime);
                
                if (product.getQuantity() <= reorderPoint) {
                    DashboardDto.ReorderAlert alert = new DashboardDto.ReorderAlert();
                    alert.setProduct(product);
                    alert.setAverageDailySales(averageDailySales);
                    alert.setReorderPoint(reorderPoint);
                    
                    int daysLeft = (int) (product.getQuantity() / averageDailySales);
                    alert.setDaysLeft(daysLeft);
                    
                    reorderAlerts.add(alert);
                }
            }
        }
        stats.setReorderAlerts(reorderAlerts);

        // Supplier Recommendation System
        List<DashboardDto.SupplierScore> recommendedSuppliers = new ArrayList<>();
        for (Supplier supplier : allSuppliers) {
            if (supplier.getRating() != null && supplier.getDeliveryTime() != null && supplier.getPriceLevel() != null && supplier.getDeliveryTime() > 0 && supplier.getPriceLevel() > 0) {
                double score = (supplier.getRating() * 0.5) + (1.0 / supplier.getDeliveryTime() * 0.3) + (1.0 / supplier.getPriceLevel() * 0.2);
                DashboardDto.SupplierScore sScore = new DashboardDto.SupplierScore();
                sScore.setSupplier(supplier);
                sScore.setScore(score);
                recommendedSuppliers.add(sScore);
            }
        }
        recommendedSuppliers.sort(Comparator.comparingDouble(DashboardDto.SupplierScore::getScore).reversed());
        // Return top 5
        stats.setRecommendedSuppliers(recommendedSuppliers.stream().limit(5).collect(Collectors.toList()));

        return stats;
    }
}
