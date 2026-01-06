package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.order.CreateOrderRequest;
import org.pwr.store.dto.order.OrderAvailabilityDTO;
import org.pwr.store.dto.order.OrderDTO;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final ProductRepository productRepository;
    private final ProductItemRepository productItemRepository;
    private final StoreRepository storeRepository;
    private final CustomerRepository customerRepository;

    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<OrderDTO> getOrdersByCustomer(Integer customerId, Pageable pageable) {
        return orderRepository.findByCustomerCustomerId(customerId, pageable).map(this::toDTO);
    }

    public Page<OrderDTO> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable).map(this::toDTO);
    }

    public Page<OrderDTO> getOrdersByStore(Integer storeId, Pageable pageable) {
        return orderRepository.findByPickupStoreStoreId(storeId, pageable).map(this::toDTO);
    }

    public OrderDTO getOrderById(Integer id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return toDTO(order);
    }

    @Transactional
    public OrderDTO createOrder(Integer customerId, CreateOrderRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        Store pickupStore = storeRepository.findById(request.getPickupStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getPickupStoreId()));

        // Create order
        CustomerOrder order = new CustomerOrder();
        order.setCustomer(customer);
        order.setPickupStore(pickupStore);
        order.setStatus(OrderStatus.NOWE);
        order.setTotalAmount(BigDecimal.ZERO);

        order = orderRepository.save(order);

        // Create order lines and calculate total
        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderLineRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lineReq.getProductId()));

            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setProduct(product);
            line.setQuantity(lineReq.getQuantity());
            line.setPriceAtOrder(product.getBasePrice());
            orderLineRepository.save(line);

            BigDecimal lineTotal = product.getBasePrice().multiply(BigDecimal.valueOf(lineReq.getQuantity()));
            total = total.add(lineTotal);
        }

        // Update total
        order.setTotalAmount(total);
        order = orderRepository.save(order);

        return toDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Integer id, OrderStatus status) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setStatus(status);
        order = orderRepository.save(order);
        return toDTO(order);
    }

    @Transactional
    public void cancelOrder(Integer id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.ZAKONCZONE) {
            throw new IllegalStateException("Cannot cancel completed order");
        }

        order.setStatus(OrderStatus.ANULOWANE);
        orderRepository.save(order);
    }

    public OrderAvailabilityDTO checkOrderAvailability(Integer pickupStoreId, CreateOrderRequest request) {
        Store pickupStore = storeRepository.findById(pickupStoreId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + pickupStoreId));

        List<OrderAvailabilityDTO.ProductAvailability> productAvailabilities = new ArrayList<>();
        boolean allAvailable = true;

        for (CreateOrderRequest.OrderLineRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lineReq.getProductId()));

            // Check availability in pickup store
            List<ProductItem> itemsInPickupStore = productItemRepository.findAvailableItemsInStore(
                    product.getProductId(),
                    pickupStoreId,
                    ProductStatus.NA_STANIE
            );

            int availableInPickupStore = itemsInPickupStore.size();
            boolean productAvailable = availableInPickupStore >= lineReq.getQuantity();

            // If not enough in pickup store, check other stores
            Map<Integer, OrderAvailabilityDTO.ProductAvailability.StoreStock> alternativeStores = new HashMap<>();
            if (!productAvailable) {
                List<ProductStatus> availableStatuses = Arrays.asList(ProductStatus.NA_STANIE, ProductStatus.NA_EKSPOZYCJI);
                List<Object[]> storeStocks = productItemRepository.countAvailableByStore(product.getProductId(), availableStatuses);

                for (Object[] row : storeStocks) {
                    Integer storeId = (Integer) row[0];
                    Long count = (Long) row[1];

                    if (!storeId.equals(pickupStoreId)) {
                        Store store = storeRepository.findById(storeId).orElse(null);
                        if (store != null) {
                            alternativeStores.put(storeId, new OrderAvailabilityDTO.ProductAvailability.StoreStock(
                                    storeId,
                                    store.getAddress(),
                                    store.getCity(),
                                    count.intValue()
                            ));
                        }
                    }
                }
            }

            productAvailabilities.add(new OrderAvailabilityDTO.ProductAvailability(
                    product.getProductId(),
                    product.getName(),
                    lineReq.getQuantity(),
                    availableInPickupStore,
                    alternativeStores,
                    productAvailable
            ));

            if (!productAvailable) {
                allAvailable = false;
            }
        }

        String message = allAvailable 
                ? "All products are available in the selected store"
                : "Some products are not available in sufficient quantity. Check alternative stores.";

        return new OrderAvailabilityDTO(productAvailabilities, allAvailable, message);
    }

    private OrderDTO toDTO(CustomerOrder order) {
        List<OrderLine> lines = orderLineRepository.findByOrderOrderId(order.getOrderId());

        List<OrderDTO.OrderLineDTO> lineDTOs = lines.stream()
                .map(line -> {
                    BigDecimal lineTotal = line.getPriceAtOrder().multiply(BigDecimal.valueOf(line.getQuantity()));
                    return new OrderDTO.OrderLineDTO(
                            line.getOrderLineId(),
                            line.getProduct().getProductId(),
                            line.getProduct().getName(),
                            line.getQuantity(),
                            line.getPriceAtOrder(),
                            lineTotal
                    );
                })
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getOrderId(),
                order.getCustomer().getCustomerId(),
                order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName(),
                order.getPickupStore().getStoreId(),
                order.getPickupStore().getAddress(),
                order.getPickupStore().getCity(),
                order.getOrderDate(),
                order.getStatus().name(),
                order.getTotalAmount(),
                lineDTOs
        );
    }
}
