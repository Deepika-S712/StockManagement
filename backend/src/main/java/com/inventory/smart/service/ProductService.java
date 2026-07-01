package com.inventory.smart.service;

import com.inventory.smart.model.Product;
import com.inventory.smart.model.StockHistory;
import com.inventory.smart.repository.ProductRepository;
import com.inventory.smart.repository.StockHistoryRepository;
import com.inventory.smart.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockHistoryRepository stockHistoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product addProduct(Product product) {
        if (product.getSupplier() != null && product.getSupplier().getId() != null) {
            product.setSupplier(supplierRepository.findById(product.getSupplier().getId()).orElse(null));
        }
        Product savedProduct = productRepository.save(product);

        // Record initial stock
        StockHistory history = new StockHistory();
        history.setProduct(savedProduct);
        history.setChangeType("ADD");
        history.setQuantity(savedProduct.getQuantity());
        stockHistoryRepository.save(history);

        return savedProduct;
    }

    public Product updateProduct(Long id, Product details) {
        Product product = getProductById(id);
        
        Integer oldQty = product.getQuantity();
        
        product.setName(details.getName());
        product.setCategory(details.getCategory());
        product.setPrice(details.getPrice());
        product.setQuantity(details.getQuantity());

        if (details.getSupplier() != null && details.getSupplier().getId() != null) {
            product.setSupplier(supplierRepository.findById(details.getSupplier().getId()).orElse(null));
        }
        
        Product updatedProduct = productRepository.save(product);

        if (!oldQty.equals(details.getQuantity())) {
            StockHistory history = new StockHistory();
            history.setProduct(updatedProduct);
            if (details.getQuantity() > oldQty) {
                history.setChangeType("ADD");
                history.setQuantity(details.getQuantity() - oldQty);
            } else {
                history.setChangeType("REDUCE");
                history.setQuantity(oldQty - details.getQuantity());
            }
            stockHistoryRepository.save(history);
        }

        return updatedProduct;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
