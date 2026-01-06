package org.pwr.store.controller;

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
public class EmployeeAuthController {

    private final EmployeeAuthService employeeAuthService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = employeeAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
