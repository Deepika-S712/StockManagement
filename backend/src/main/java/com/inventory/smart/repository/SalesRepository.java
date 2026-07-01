package com.inventory.smart.repository;

import com.inventory.smart.model.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface SalesRepository extends JpaRepository<Sales, Long> {
    List<Sales> findByDateAfter(LocalDateTime date);
    List<Sales> findByProductId(Long productId);
}
