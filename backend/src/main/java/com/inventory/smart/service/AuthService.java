package com.inventory.smart.service;

import com.inventory.smart.dto.AuthDto;
import com.inventory.smart.model.User;
import com.inventory.smart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        // In a real app, hash password here
        return userRepository.save(user);
    }

    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        System.out.println("Login attempt for: " + request.getEmail());
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User found. Comparing passwords...");
            System.out.println("Expected: '" + user.getPassword() + "'");
            System.out.println("Received: '" + request.getPassword() + "'");
            
            if (user.getPassword().equals(request.getPassword())) {
                AuthDto.LoginResponse response = new AuthDto.LoginResponse();
                response.setMessage("Login successful");
                response.setUserId(user.getId());
                response.setRole(user.getRole());
                response.setName(user.getName());
                return response;
            }
        }
        throw new RuntimeException("Invalid credentials");
    }
}
