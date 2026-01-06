package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.AuthResponse;
import org.pwr.store.dto.LoginRequest;
import org.pwr.store.dto.RegisterCustomerRequest;
import org.pwr.store.service.CustomerAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/customer")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterCustomerRequest request) {
        AuthResponse response = customerAuthService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = customerAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
