package org.pwr.store.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.AuthResponse;
import org.pwr.store.dto.LoginRequest;
import org.pwr.store.service.EmployeeAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/employee")
@RequiredArgsConstructor
@Tag(name = "Employee Authentication", description = "Employee login endpoint")
public class EmployeeAuthController {

    private final EmployeeAuthService employeeAuthService;

    @PostMapping("/login")
    @Operation(summary = "Employee login", description = "Authenticate employee and receive JWT token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = employeeAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
