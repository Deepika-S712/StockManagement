package com.inventory.smart.dto;

import com.inventory.smart.model.Product;
import com.inventory.smart.model.Supplier;
import java.util.List;

public class DashboardDto {
    
    public static class DashboardStats {
        private long totalProducts;
        private long totalSales;
        private List<Product> lowStockItems;
        private List<ReorderAlert> reorderAlerts;
        private List<SupplierScore> recommendedSuppliers;

        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
        public long getTotalSales() { return totalSales; }
        public void setTotalSales(long totalSales) { this.totalSales = totalSales; }
        public List<Product> getLowStockItems() { return lowStockItems; }
        public void setLowStockItems(List<Product> lowStockItems) { this.lowStockItems = lowStockItems; }
        public List<ReorderAlert> getReorderAlerts() { return reorderAlerts; }
        public void setReorderAlerts(List<ReorderAlert> reorderAlerts) { this.reorderAlerts = reorderAlerts; }
        public List<SupplierScore> getRecommendedSuppliers() { return recommendedSuppliers; }
        public void setRecommendedSuppliers(List<SupplierScore> recommendedSuppliers) { this.recommendedSuppliers = recommendedSuppliers; }
    }

    public static class ReorderAlert {
        private Product product;
        private double averageDailySales;
        private int reorderPoint;
        private int daysLeft;

        public Product getProduct() { return product; }
        public void setProduct(Product product) { this.product = product; }
        public double getAverageDailySales() { return averageDailySales; }
        public void setAverageDailySales(double averageDailySales) { this.averageDailySales = averageDailySales; }
        public int getReorderPoint() { return reorderPoint; }
        public void setReorderPoint(int reorderPoint) { this.reorderPoint = reorderPoint; }
        public int getDaysLeft() { return daysLeft; }
        public void setDaysLeft(int daysLeft) { this.daysLeft = daysLeft; }
    }

    public static class SupplierScore {
        private Supplier supplier;
        private double score;

        public Supplier getSupplier() { return supplier; }
        public void setSupplier(Supplier supplier) { this.supplier = supplier; }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
    }
}
