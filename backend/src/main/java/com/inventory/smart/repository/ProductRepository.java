package com.inventory.smart.repository;

import com.inventory.smart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryContainingIgnoreCase(String category);
    List<Product> findByQuantityLessThan(Integer quantity);
}
