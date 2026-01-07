package org.pwr.store.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Customer Authentication", description = "Customer registration and login endpoints")
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    @Operation(summary = "Register new customer", description = "Create a new customer account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Customer registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or email already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterCustomerRequest request) {
        AuthResponse response = customerAuthService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Customer login", description = "Authenticate customer and receive JWT token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = customerAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
