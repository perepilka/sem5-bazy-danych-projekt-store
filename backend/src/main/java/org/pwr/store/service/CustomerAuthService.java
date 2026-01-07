package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.AuthResponse;
import org.pwr.store.dto.LoginRequest;
import org.pwr.store.dto.RegisterCustomerRequest;
import org.pwr.store.exception.AuthenticationException;
import org.pwr.store.exception.ResourceAlreadyExistsException;
import org.pwr.store.model.Customer;
import org.pwr.store.repository.CustomerRepository;
import org.pwr.store.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already registered");
        }

        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        customer = customerRepository.save(customer);

        String token = jwtUtil.generateToken(customer.getEmail(), "CUSTOMER", null);

        return new AuthResponse(token, "CUSTOMER", customer.getEmail(), null);
    }

    public AuthResponse login(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(customer.getEmail(), "CUSTOMER", null);

        return new AuthResponse(token, "CUSTOMER", customer.getEmail(), null);
    }
}
