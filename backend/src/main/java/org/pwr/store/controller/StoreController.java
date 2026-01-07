package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.store.CreateStoreRequest;
import org.pwr.store.dto.store.StoreDTO;
import org.pwr.store.dto.store.StoreInventoryDTO;
import org.pwr.store.dto.store.UpdateStoreRequest;
import org.pwr.store.service.StoreService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<StoreDTO>> getAllStores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("city", "address"));
        return ResponseEntity.ok(storeService.getAllStores(pageable));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StoreDTO>> searchStores(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(storeService.searchStores(query));
    }

    @GetMapping("/city/{city}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StoreDTO>> getStoresByCity(@PathVariable String city) {
        return ResponseEntity.ok(storeService.getStoresByCity(city));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StoreDTO> getStoreById(@PathVariable Integer id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    @GetMapping("/{id}/inventory")
    @PreAuthorize("hasAnyRole('KIEROWNIK', 'MAGAZYNIER', 'SPRZEDAWCA')")
    public ResponseEntity<List<StoreInventoryDTO>> getStoreInventory(@PathVariable Integer id) {
        return ResponseEntity.ok(storeService.getStoreInventory(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<StoreDTO> createStore(@Valid @RequestBody CreateStoreRequest request) {
        StoreDTO store = storeService.createStore(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(store);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<StoreDTO> updateStore(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStoreRequest request) {
        return ResponseEntity.ok(storeService.updateStore(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<Void> deleteStore(@PathVariable Integer id) {
        storeService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }
}
