package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.delivery.CreateDeliveryRequest;
import org.pwr.store.dto.delivery.DeliveryDTO;
import org.pwr.store.dto.delivery.RestockSuggestionDTO;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.*;
import org.pwr.store.model.enums.OrderStatus;
import org.pwr.store.model.enums.ProductStatus;
import org.pwr.store.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryLineRepository deliveryLineRepository;
    private final ProductRepository productRepository;
    private final ProductItemRepository productItemRepository;
    private final StoreRepository storeRepository;
    private final CustomerOrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;

    public Page<DeliveryDTO> getAllDeliveries(Pageable pageable) {
        return deliveryRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<DeliveryDTO> getDeliveriesByStatus(String status, Pageable pageable) {
        return deliveryRepository.findByStatus(status, pageable).map(this::toDTO);
    }

    public DeliveryDTO getDeliveryById(Integer id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + id));
        return toDTO(delivery);
    }

    @Transactional
    public DeliveryDTO createDelivery(CreateDeliveryRequest request) {
        // Create delivery
        Delivery delivery = new Delivery();
        delivery.setSupplierName(request.getSupplierName());
        delivery.setDeliveryDate(request.getDeliveryDate() != null ? request.getDeliveryDate() : LocalDate.now());
        delivery.setStatus("PRZYJETA");

        // Set store if provided in any of the lines (all lines should have same
        // storeId)
        if (!request.getLines().isEmpty() && request.getLines().get(0).getStoreId() != null) {
            Store store = storeRepository.findById(request.getLines().get(0).getStoreId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Store not found with id: " + request.getLines().get(0).getStoreId()));
            delivery.setStore(store);
        }

        delivery = deliveryRepository.save(delivery);

        // Create delivery lines
        for (CreateDeliveryRequest.DeliveryLineRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + lineReq.getProductId()));

            DeliveryLine line = new DeliveryLine();
            line.setDelivery(delivery);
            line.setProduct(product);
            line.setQuantity(lineReq.getQuantity());
            line.setPurchasePrice(lineReq.getPurchasePrice());
            deliveryLineRepository.save(line);
        }

        return toDTO(delivery);
    }

    @Transactional
    public DeliveryDTO updateDeliveryStatus(Integer id, String status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + id));

        String oldStatus = delivery.getStatus();
        delivery.setStatus(status);
        delivery = deliveryRepository.save(delivery);

        // When delivery is marked as ZREALIZOWANA, create product items in store
        if ("ZREALIZOWANA".equals(status) && !"ZREALIZOWANA".equals(oldStatus)) {
            if (delivery.getStore() == null) {
                throw new IllegalStateException("Cannot complete delivery without assigned store");
            }

            List<DeliveryLine> lines = deliveryLineRepository.findByDeliveryDeliveryId(delivery.getDeliveryId());

            for (DeliveryLine line : lines) {
                // Create product items for each quantity in the delivery line
                for (int i = 0; i < line.getQuantity(); i++) {
                    ProductItem item = new ProductItem();
                    item.setProduct(line.getProduct());
                    item.setDeliveryId(delivery.getDeliveryId());
                    item.setStore(delivery.getStore());
                    item.setCurrentStatus(ProductStatus.NA_STANIE);
                    productItemRepository.save(item);
                }
            }
        }

        return toDTO(delivery);
    }

    @Transactional(readOnly = true)
    public List<RestockSuggestionDTO> getRestockSuggestions() {
        // Find all active orders (NOWE) which are waiting for processing
        List<CustomerOrder> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.NOWE)
                .collect(Collectors.toList());

        // Map<StoreId, Map<ProductId, quantityNeeded>>
        java.util.Map<Integer, java.util.Map<Integer, Integer>> storeRequirements = new java.util.HashMap<>();

        for (CustomerOrder order : activeOrders) {
            List<OrderLine> lines = orderLineRepository.findByOrderOrderId(order.getOrderId());
            for (OrderLine line : lines) {
                storeRequirements
                        .computeIfAbsent(order.getPickupStore().getStoreId(), k -> new java.util.HashMap<>())
                        .merge(line.getProduct().getProductId(), line.getQuantity(), Integer::sum);
            }
        }

        // Fetch pending deliveries (PRZYJETA or W_TRAKCIE)
        List<Delivery> pendingDeliveries = deliveryRepository
                .findByStatusIn(java.util.Arrays.asList("PRZYJETA", "W_TRAKCIE"));

        // Map<StoreId, Map<ProductId, quantityPending>>
        java.util.Map<Integer, java.util.Map<Integer, Integer>> pendingStock = new java.util.HashMap<>();

        for (Delivery delivery : pendingDeliveries) {
            if (delivery.getStore() == null)
                continue;
            Integer storeId = delivery.getStore().getStoreId();

            List<DeliveryLine> lines = deliveryLineRepository.findByDeliveryDeliveryId(delivery.getDeliveryId());
            for (DeliveryLine line : lines) {
                pendingStock
                        .computeIfAbsent(storeId, k -> new java.util.HashMap<>())
                        .merge(line.getProduct().getProductId(), line.getQuantity(), Integer::sum);
            }
        }

        List<RestockSuggestionDTO> suggestions = new ArrayList<>();

        for (java.util.Map.Entry<Integer, java.util.Map<Integer, Integer>> storeEntry : storeRequirements.entrySet()) {
            Integer storeId = storeEntry.getKey();
            java.util.Map<Integer, Integer> productRequirements = storeEntry.getValue();

            Store store = storeRepository.findById(storeId).orElse(null);
            if (store == null)
                continue;

            List<RestockSuggestionDTO.ProductRequest> neededProducts = new ArrayList<>();

            for (java.util.Map.Entry<Integer, Integer> productEntry : productRequirements.entrySet()) {
                Integer productId = productEntry.getKey();
                Integer quantityNeeded = productEntry.getValue();

                // Check active pending deliveries for this store and product
                Integer quantityPending = pendingStock.getOrDefault(storeId, new java.util.HashMap<>())
                        .getOrDefault(productId, 0);

                // If we have enough coming in pending deliveries, reduce the needed amount
                int netNeeded = quantityNeeded - quantityPending;

                if (netNeeded <= 0)
                    continue; // Needs fully covered by pending deliveries

                // Check current stock
                long currentStock = productItemRepository.countByProductProductIdAndStoreStoreIdAndCurrentStatus(
                        productId, storeId, ProductStatus.NA_STANIE);

                // Effective needed is netNeeded (orders - pending) - currentStock
                // Wait, logic check:
                // Total Needed = Orders
                // Covered = Pending + Current
                // Deficit = Total Needed - (Pending + Current)

                int deficit = quantityNeeded - (quantityPending + (int) currentStock);

                if (deficit > 0) {
                    Product product = productRepository.findById(productId).orElse(null);
                    if (product != null) {
                        neededProducts.add(new RestockSuggestionDTO.ProductRequest(
                                productId,
                                product.getName(),
                                deficit,
                                (int) currentStock));
                    }
                }
            }

            if (!neededProducts.isEmpty()) {
                suggestions.add(new RestockSuggestionDTO(
                        storeId,
                        store.getAddress(),
                        store.getCity(),
                        neededProducts));
            }
        }

        return suggestions;
    }

    @Transactional
    public void deleteDelivery(Integer id) {
        if (!deliveryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Delivery not found with id: " + id);
        }
        deliveryRepository.deleteById(id);
    }

    private DeliveryDTO toDTO(Delivery delivery) {
        List<DeliveryLine> lines = deliveryLineRepository.findByDeliveryDeliveryId(delivery.getDeliveryId());

        List<DeliveryDTO.DeliveryLineDTO> lineDTOs = lines.stream()
                .map(line -> {
                    BigDecimal total = line.getPurchasePrice().multiply(BigDecimal.valueOf(line.getQuantity()));
                    return new DeliveryDTO.DeliveryLineDTO(
                            line.getDeliveryLineId(),
                            line.getProduct().getProductId(),
                            line.getProduct().getName(),
                            line.getQuantity(),
                            line.getPurchasePrice(),
                            total);
                })
                .collect(Collectors.toList());

        return new DeliveryDTO(
                delivery.getDeliveryId(),
                delivery.getSupplierName(),
                delivery.getDeliveryDate(),
                delivery.getStatus(),
                lineDTOs);
    }
}
