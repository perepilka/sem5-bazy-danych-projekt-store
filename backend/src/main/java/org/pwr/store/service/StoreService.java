package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.store.CreateStoreRequest;
import org.pwr.store.dto.store.StoreDTO;
import org.pwr.store.dto.store.StoreInventoryDTO;
import org.pwr.store.dto.store.UpdateStoreRequest;
import org.pwr.store.exception.ResourceAlreadyExistsException;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.ProductItem;
import org.pwr.store.model.Store;
import org.pwr.store.model.enums.ProductStatus;
import org.pwr.store.repository.EmployeeRepository;
import org.pwr.store.repository.ProductItemRepository;
import org.pwr.store.repository.StoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductItemRepository productItemRepository;

    public Page<StoreDTO> getAllStores(Pageable pageable) {
        return storeRepository.findAll(pageable).map(this::toDTO);
    }

    public List<StoreDTO> searchStores(String search) {
        if (search == null || search.trim().isEmpty()) {
            return storeRepository.findAll().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return storeRepository.searchStores(search.trim()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StoreDTO> getStoresByCity(String city) {
        return storeRepository.findByCityContainingIgnoreCase(city).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public StoreDTO getStoreById(Integer id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        return toDTO(store);
    }

    @Transactional
    public StoreDTO createStore(CreateStoreRequest request) {
        // Check if store already exists at this location
        Optional<Store> existing = storeRepository.findByAddressAndCity(request.getAddress(), request.getCity());
        if (existing.isPresent()) {
            throw new ResourceAlreadyExistsException("Store already exists at this address in " + request.getCity());
        }

        Store store = new Store();
        store.setAddress(request.getAddress());
        store.setCity(request.getCity());
        store.setPhoneNumber(request.getPhoneNumber());

        store = storeRepository.save(store);
        return toDTO(store);
    }

    @Transactional
    public StoreDTO updateStore(Integer id, UpdateStoreRequest request) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

        // Check if updating to an address that already exists (different store)
        Optional<Store> existing = storeRepository.findByAddressAndCity(request.getAddress(), request.getCity());
        if (existing.isPresent() && !existing.get().getStoreId().equals(id)) {
            throw new ResourceAlreadyExistsException("Another store already exists at this address in " + request.getCity());
        }

        store.setAddress(request.getAddress());
        store.setCity(request.getCity());
        store.setPhoneNumber(request.getPhoneNumber());

        store = storeRepository.save(store);
        return toDTO(store);
    }

    @Transactional
    public void deleteStore(Integer id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

        // Check if store has employees
        long employeeCount = employeeRepository.countByStoreStoreId(id);
        if (employeeCount > 0) {
            throw new IllegalStateException("Cannot delete store with " + employeeCount + " employees. Reassign employees first.");
        }

        // Check if store has inventory
        long itemCount = productItemRepository.countByStoreStoreId(id);
        if (itemCount > 0) {
            throw new IllegalStateException("Cannot delete store with " + itemCount + " items in inventory. Transfer inventory first.");
        }

        storeRepository.deleteById(id);
    }

    public List<StoreInventoryDTO> getStoreInventory(Integer storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        List<ProductItem> items = productItemRepository.findByStoreStoreId(storeId);

        // Group by product
        Map<Integer, List<ProductItem>> itemsByProduct = items.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getProductId()));

        return itemsByProduct.entrySet().stream()
                .map(entry -> {
                    List<ProductItem> productItems = entry.getValue();
                    ProductItem firstItem = productItems.get(0);

                    int availableCount = (int) productItems.stream()
                            .filter(item -> item.getCurrentStatus() == ProductStatus.NA_STANIE)
                            .count();

                    int onDisplayCount = (int) productItems.stream()
                            .filter(item -> item.getCurrentStatus() == ProductStatus.NA_EKSPOZYCJI)
                            .count();

                    int reservedCount = (int) productItems.stream()
                            .filter(item -> item.getCurrentStatus() == ProductStatus.ZAREZERWOWANY ||
                                          item.getCurrentStatus() == ProductStatus.OCZEKUJE_NA_ODBIOR)
                            .count();

                    return new StoreInventoryDTO(
                            firstItem.getProduct().getProductId(),
                            firstItem.getProduct().getName(),
                            firstItem.getProduct().getCategory().getName(),
                            availableCount,
                            onDisplayCount,
                            reservedCount,
                            productItems.size()
                    );
                })
                .sorted(Comparator.comparing(StoreInventoryDTO::getProductName))
                .collect(Collectors.toList());
    }

    private StoreDTO toDTO(Store store) {
        long employeeCount = employeeRepository.countByStoreStoreId(store.getStoreId());
        long productCount = productItemRepository.countByStoreStoreId(store.getStoreId());

        return new StoreDTO(
                store.getStoreId(),
                store.getAddress(),
                store.getCity(),
                store.getPhoneNumber(),
                (int) employeeCount,
                (int) productCount
        );
    }
}
