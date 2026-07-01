package com.inventory.smart.config;

import com.inventory.smart.model.*;
import com.inventory.smart.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   SupplierRepository supplierRepository,
                                   ProductRepository productRepository,
                                   SalesRepository salesRepository,
                                   StockHistoryRepository stockHistoryRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@test.com").isEmpty()) {
                User admin = new User();
                admin.setName("Master Admin");
                admin.setEmail("admin@test.com");
                admin.setPassword("password");
                admin.setRole("Admin");
                userRepository.save(admin);
                System.out.println("Default admin user created: admin@test.com / password");
            }
            
            if (userRepository.findByEmail("deepi@021.com").isEmpty()) {
                User deepi = new User();
                deepi.setName("Deepi");
                deepi.setEmail("deepi@021.com");
                deepi.setPassword("password");
                deepi.setRole("Admin");
                userRepository.save(deepi);
                System.out.println("User deepi@021.com created with password: password");
            }

            System.out.println("Clean database initialized. No default products or suppliers added.");
        };
    }
}
