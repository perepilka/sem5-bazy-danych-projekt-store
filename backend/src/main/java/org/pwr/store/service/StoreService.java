package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.store.CreateStoreRequest;
import org.pwr.store.dto.store.StoreDTO;
import org.pwr.store.dto.store.StoreInventoryDTO;
import org.pwr.store.dto.store.UpdateStoreRequest;
import org.pwr.store.exception.ResourceAlreadyExistsException;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.ProductItem;
import org.pwr.store.model.Product;
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
    private final org.pwr.store.repository.ProductRepository productRepository;
    private final org.pwr.store.repository.DeliveryRepository deliveryRepository;
    private final org.pwr.store.repository.DeliveryLineRepository deliveryLineRepository;

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

        List<ProductItem> items = productItemRepository.findByStoreStoreIdWithProduct(storeId);

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

    public List<org.pwr.store.dto.store.LowStockItemDTO> getLowStockItems(Integer storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new org.pwr.store.exception.ResourceNotFoundException("Store not found"));

        List<Product> allProducts = productRepository.findAll();
        List<org.pwr.store.dto.store.LowStockItemDTO> lowStockItems = new java.util.ArrayList<>();

        for (Product product : allProducts) {
            long currentStock = productItemRepository.countByProductProductIdAndStoreStoreIdAndCurrentStatus(
                    product.getProductId(),
                    storeId,
                    org.pwr.store.model.enums.ProductStatus.NA_STANIE
            );

            if (currentStock < product.getLowStockThreshold()) {
                int quantityNeeded = product.getMinimumStock() - (int) currentStock;
                if (quantityNeeded > 0) {
                    lowStockItems.add(new org.pwr.store.dto.store.LowStockItemDTO(
                            product.getProductId(),
                            product.getName(),
                            storeId,
                            store.getAddress() + ", " + store.getCity(),
                            (int) currentStock,
                            product.getLowStockThreshold(),
                            product.getMinimumStock(),
                            quantityNeeded
                    ));
                }
            }
        }

        return lowStockItems;
    }

    @Transactional
    public org.pwr.store.dto.delivery.DeliveryDTO createAutoDeliveryForLowStock(Integer storeId) {
        List<org.pwr.store.dto.store.LowStockItemDTO> lowStockItems = getLowStockItems(storeId);

        if (lowStockItems.isEmpty()) {
            throw new IllegalStateException("No low stock items found for this store");
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        // Create delivery
        org.pwr.store.model.Delivery delivery = new org.pwr.store.model.Delivery();
        delivery.setSupplierName("Auto-Restocking");
        delivery.setDeliveryDate(java.time.LocalDate.now().plusDays(3)); // Delivery in 3 days
        delivery.setStatus("PRZYJETA");
        delivery.setStore(store);
        delivery = deliveryRepository.save(delivery);

        // Create delivery lines for each low stock product
        for (org.pwr.store.dto.store.LowStockItemDTO item : lowStockItems) {
            org.pwr.store.model.Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            org.pwr.store.model.DeliveryLine line = new org.pwr.store.model.DeliveryLine();
            line.setDelivery(delivery);
            line.setProduct(product);
            line.setQuantity(item.getQuantityNeeded());
            line.setPurchasePrice(product.getBasePrice().multiply(java.math.BigDecimal.valueOf(0.7))); // 70% of base price

            deliveryLineRepository.save(line);
        }

        // Convert to DTO and return
        return convertDeliveryToDTO(delivery);
    }

    private org.pwr.store.dto.delivery.DeliveryDTO convertDeliveryToDTO(org.pwr.store.model.Delivery delivery) {
        List<org.pwr.store.model.DeliveryLine> lines = deliveryLineRepository.findByDeliveryDeliveryId(delivery.getDeliveryId());

        List<org.pwr.store.dto.delivery.DeliveryDTO.DeliveryLineDTO> lineDTOs = lines.stream()
                .map(line -> new org.pwr.store.dto.delivery.DeliveryDTO.DeliveryLineDTO(
                        line.getDeliveryLineId(),
                        line.getProduct().getProductId(),
                        line.getProduct().getName(),
                        line.getQuantity(),
                        line.getPurchasePrice(),
                        line.getPurchasePrice().multiply(java.math.BigDecimal.valueOf(line.getQuantity()))
                ))
                .collect(Collectors.toList());

        return new org.pwr.store.dto.delivery.DeliveryDTO(
                delivery.getDeliveryId(),
                delivery.getSupplierName(),
                delivery.getDeliveryDate(),
                delivery.getStatus(),
                lineDTOs
        );
    }
}
