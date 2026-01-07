package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.transaction.CreateTransactionRequest;
import org.pwr.store.dto.transaction.TransactionDTO;
import org.pwr.store.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<Page<TransactionDTO>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer employeeId,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) String documentType) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());

        if (employeeId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByEmployee(employeeId, pageable));
        }

        if (customerId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByCustomer(customerId, pageable));
        }

        if (documentType != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByDocumentType(documentType, pageable));
        }

        return ResponseEntity.ok(transactionService.getAllTransactions(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'SPRZEDAWCA')")
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        TransactionDTO transaction = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Integer id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
