package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.order.CreateOrderRequest;
import org.pwr.store.dto.order.OrderAvailabilityDTO;
import org.pwr.store.dto.order.OrderDTO;
import org.pwr.store.model.enums.OrderStatus;
import org.pwr.store.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer storeId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());

        if (status != null && !status.isEmpty()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status);
            return ResponseEntity.ok(orderService.getOrdersByStatus(orderStatus, pageable));
        }

        if (storeId != null) {
            return ResponseEntity.ok(orderService.getOrdersByStore(storeId, pageable));
        }

        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderDTO>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // In real implementation, extract customer ID from JWT
        // For now, this is a placeholder
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {

        // In real implementation, extract customer ID from JWT
        // For now, use a placeholder (customer with ID 1)
        Integer customerId = 1; // TODO: Extract from JWT token
        OrderDTO order = orderService.createOrder(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/check-availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderAvailabilityDTO> checkAvailability(@Valid @RequestBody CreateOrderRequest request) {
        OrderAvailabilityDTO availability = orderService.checkOrderAvailability(request.getPickupStoreId(), request);
        return ResponseEntity.ok(availability);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        OrderStatus orderStatus = OrderStatus.valueOf(status);
        return ResponseEntity.ok(orderService.updateOrderStatus(id, orderStatus));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'KIEROWNIK')")
    public ResponseEntity<Void> cancelOrder(@PathVariable Integer id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
