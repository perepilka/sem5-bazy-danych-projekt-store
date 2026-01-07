package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.returns.CreateReturnRequest;
import org.pwr.store.dto.returns.ReturnDTO;
import org.pwr.store.dto.returns.UpdateReturnStatusRequest;
import org.pwr.store.service.ReturnService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    @GetMapping
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<Page<ReturnDTO>> getAllReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer transactionId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("returnDate").descending());

        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(returnService.getReturnsByStatus(status, pageable));
        }

        if (transactionId != null) {
            return ResponseEntity.ok(returnService.getReturnsByTransaction(transactionId, pageable));
        }

        return ResponseEntity.ok(returnService.getAllReturns(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA', 'CUSTOMER')")
    public ResponseEntity<ReturnDTO> getReturnById(@PathVariable Integer id) {
        return ResponseEntity.ok(returnService.getReturnById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SPRZEDAWCA')")
    public ResponseEntity<ReturnDTO> createReturn(@Valid @RequestBody CreateReturnRequest request) {
        ReturnDTO returnDTO = returnService.createReturn(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(returnDTO);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<ReturnDTO> updateReturnStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateReturnStatusRequest request) {
        return ResponseEntity.ok(returnService.updateReturnStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<Void> deleteReturn(@PathVariable Integer id) {
        returnService.deleteReturn(id);
        return ResponseEntity.noContent().build();
    }
}
