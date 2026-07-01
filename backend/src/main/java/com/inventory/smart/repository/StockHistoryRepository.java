package com.inventory.smart.repository;

import com.inventory.smart.model.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    List<StockHistory> findByProductIdOrderByDateDesc(Long productId);
    List<StockHistory> findAllByOrderByDateDesc();
}
