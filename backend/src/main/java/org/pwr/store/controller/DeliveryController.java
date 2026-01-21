package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.delivery.CreateDeliveryRequest;
import org.pwr.store.dto.delivery.DeliveryDTO;
import org.pwr.store.dto.delivery.RestockSuggestionDTO;
import org.pwr.store.service.DeliveryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'MAGAZYNIER')")
    public ResponseEntity<Page<DeliveryDTO>> getAllDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("deliveryDate").descending());

        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(deliveryService.getDeliveriesByStatus(status, pageable));
        }

        return ResponseEntity.ok(deliveryService.getAllDeliveries(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'MAGAZYNIER')")
    public ResponseEntity<DeliveryDTO> getDeliveryById(@PathVariable Integer id) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(id));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("hasAnyRole('KIEROWNIK')")
    public ResponseEntity<java.util.List<RestockSuggestionDTO>> getRestockSuggestions() {
        return ResponseEntity.ok(deliveryService.getRestockSuggestions());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'MAGAZYNIER')")
    public ResponseEntity<DeliveryDTO> createDelivery(@Valid @RequestBody CreateDeliveryRequest request) {
        DeliveryDTO delivery = deliveryService.createDelivery(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(delivery);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'MAGAZYNIER')")
    public ResponseEntity<DeliveryDTO> updateDeliveryStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Integer id) {
        deliveryService.deleteDelivery(id);
        return ResponseEntity.noContent().build();
    }
}
