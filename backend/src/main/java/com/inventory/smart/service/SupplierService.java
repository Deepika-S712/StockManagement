package com.inventory.smart.service;

import com.inventory.smart.model.Supplier;
import com.inventory.smart.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    public Supplier addSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier details) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(details.getName());
        supplier.setRating(details.getRating());
        supplier.setDeliveryTime(details.getDeliveryTime());
        supplier.setPriceLevel(details.getPriceLevel());
        supplier.setContact(details.getContact());
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }
}
