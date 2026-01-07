package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.AuthResponse;
import org.pwr.store.dto.LoginRequest;
import org.pwr.store.exception.AuthenticationException;
import org.pwr.store.model.Employee;
import org.pwr.store.repository.EmployeeRepository;
import org.pwr.store.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeAuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByLogin(request.getUsername())
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        if (!employee.getIsActive()) {
            throw new AuthenticationException("Employee account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), employee.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                employee.getLogin(),
                "EMPLOYEE",
                employee.getPosition().name()
        );

        return new AuthResponse(
                token,
                "EMPLOYEE",
                employee.getLogin(),
                employee.getPosition().name()
        );
    }
}
