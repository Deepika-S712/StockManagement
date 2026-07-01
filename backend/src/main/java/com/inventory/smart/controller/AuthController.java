package com.inventory.smart.controller;

import com.inventory.smart.dto.AuthDto;
import com.inventory.smart.model.User;
import com.inventory.smart.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        System.out.println("Register attempt for: " + user.getEmail());
        try {
            return ResponseEntity.ok(authService.register(user));
        } catch (Exception e) {
            e.printStackTrace();
            // Likely a duplicate email constraint violation
            return ResponseEntity.status(400).body(new ErrorResponse("Email already exists. Please login or use a different email."));
        }
    }

    // Helper class for error responses
    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request) {
        System.out.println("DEBUG: AuthController.login called with email: " + request.getEmail());
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new ErrorResponse(e.getMessage()));
        }
    }
}
