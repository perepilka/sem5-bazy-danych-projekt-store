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
import java.time.LocalDateTime;
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
    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;

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

    @Transactional(readOnly = true)
    public Page<OrderDTO> searchOrders(Integer storeId, List<OrderStatus> statuses, Pageable pageable) {
        if (storeId != null && statuses != null && !statuses.isEmpty()) {
            if (statuses.size() == 1) {
                return orderRepository.findByPickupStoreStoreIdAndStatus(storeId, statuses.get(0), pageable)
                        .map(this::toDTO);
            }
            return orderRepository.findByPickupStoreStoreIdAndStatusIn(storeId, statuses, pageable).map(this::toDTO);
        }

        if (storeId != null) {
            return orderRepository.findByPickupStoreStoreId(storeId, pageable).map(this::toDTO);
        }

        if (statuses != null && !statuses.isEmpty()) {
            if (statuses.size() == 1) {
                return orderRepository.findByStatus(statuses.get(0), pageable).map(this::toDTO);
            }
            return orderRepository.findByStatusIn(statuses, pageable).map(this::toDTO);
        }

        return orderRepository.findAll(pageable).map(this::toDTO);
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
                .orElseThrow(
                        () -> new ResourceNotFoundException("Store not found with id: " + request.getPickupStoreId()));

        // Validate product availability in pickup store BEFORE creating order
        if (!Boolean.TRUE.equals(request.getIgnoreAvailability())) {
            for (CreateOrderRequest.OrderLineRequest lineReq : request.getLines()) {
                Product product = productRepository.findById(lineReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Product not found with id: " + lineReq.getProductId()));

                List<ProductItem> availableItems = productItemRepository.findAvailableItemsInStore(
                        lineReq.getProductId(),
                        request.getPickupStoreId(),
                        ProductStatus.NA_STANIE);

                if (availableItems.size() < lineReq.getQuantity()) {
                    throw new IllegalStateException(
                            "Insufficient inventory for product '" + product.getName() +
                                    "' in selected store. Available: " + availableItems.size() +
                                    ", Requested: " + lineReq.getQuantity() +
                                    ". Please select a different store.");
                }
            }
        }

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
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + lineReq.getProductId()));

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
    public OrderDTO updateOrderStatus(Integer id, OrderStatus newStatus) {
        System.out.println("Updating order " + id + " to status: " + newStatus);

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        OrderStatus oldStatus = order.getStatus();
        System.out.println("Old status: " + oldStatus + " -> New status: " + newStatus);

        // Handle status transitions
        if (newStatus == OrderStatus.W_REALIZACJI && oldStatus == OrderStatus.NOWE) {
            // Reserve items when starting order processing
            System.out.println("Reserving items for order");
            reserveItemsForOrder(order);
        } else if (newStatus == OrderStatus.GOTOWE_DO_ODBIORU) {
            // Magazynier can prepare order directly from NOWE
            if (oldStatus == OrderStatus.NOWE) {
                // Reserve and mark as ready in one step
                System.out.println("Reserving and marking items as ready (NOWE -> GOTOWE)");
                reserveItemsForOrder(order);
                markItemsReadyForPickup(order);
            } else if (oldStatus == OrderStatus.W_REALIZACJI) {
                // Mark already reserved items as ready for pickup
                System.out.println("Marking reserved items as ready (W_REALIZACJI -> GOTOWE)");
                markItemsReadyForPickup(order);
            }
        } else if (newStatus == OrderStatus.ZAKONCZONE) {
            // Create transaction when order is completed
            System.out.println("Completing order - old status: " + oldStatus);
            if (oldStatus == OrderStatus.GOTOWE_DO_ODBIORU) {
                createTransactionForOrder(order);
            } else {
                System.out.println("WARNING: Trying to complete order from status: " + oldStatus);
            }
        } else if (newStatus == OrderStatus.ANULOWANE) {
            // Release reserved items when order is cancelled
            System.out.println("Releasing reserved items");
            releaseReservedItems(order);
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);
        System.out.println("Order status updated successfully");
        return toDTO(order);
    }

    @Transactional
    public void cancelOrder(Integer id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.ZAKONCZONE) {
            throw new IllegalStateException("Cannot cancel completed order");
        }

        // Release any reserved items
        releaseReservedItems(order);

        order.setStatus(OrderStatus.ANULOWANE);
        orderRepository.save(order);
    }

    private void reserveItemsForOrder(CustomerOrder order) {
        List<OrderLine> lines = orderLineRepository.findByOrderOrderId(order.getOrderId());

        for (OrderLine line : lines) {
            List<ProductItem> availableItems = productItemRepository.findAvailableItemsInStore(
                    line.getProduct().getProductId(),
                    order.getPickupStore().getStoreId(),
                    ProductStatus.NA_STANIE);

            int quantityNeeded = line.getQuantity();
            int reserved = 0;

            for (ProductItem item : availableItems) {
                if (reserved >= quantityNeeded)
                    break;

                item.setCurrentStatus(ProductStatus.ZAREZERWOWANY);
                productItemRepository.save(item);
                reserved++;
            }

            if (reserved < quantityNeeded) {
                throw new IllegalStateException(
                        "Not enough items available for product: " + line.getProduct().getName());
            }
        }
    }

    private void markItemsReadyForPickup(CustomerOrder order) {
        List<OrderLine> lines = orderLineRepository.findByOrderOrderId(order.getOrderId());

        for (OrderLine line : lines) {
            // Find reserved items for this product in the pickup store
            List<ProductItem> reservedItems = productItemRepository.findAvailableItemsInStore(
                    line.getProduct().getProductId(),
                    order.getPickupStore().getStoreId(),
                    ProductStatus.ZAREZERWOWANY);

            int quantityNeeded = line.getQuantity();
            int marked = 0;

            for (ProductItem item : reservedItems) {
                if (marked >= quantityNeeded)
                    break;

                item.setCurrentStatus(ProductStatus.OCZEKUJE_NA_ODBIOR);
                productItemRepository.save(item);
                marked++;
            }
        }
    }

    private void createTransactionForOrder(CustomerOrder order) {
        System.out.println("Creating transaction for order: " + order.getOrderId());

        // Get order lines to know how many of each product we need
        List<OrderLine> lines = orderLineRepository.findByOrderOrderId(order.getOrderId());

        if (lines.isEmpty()) {
            throw new IllegalStateException("No order lines found for order #" + order.getOrderId());
        }

        Transaction transaction = new Transaction();
        transaction.setCustomer(order.getCustomer());
        transaction.setOrder(order);
        transaction.setDocumentType("PARAGON");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTotalAmount(order.getTotalAmount());
        transaction.setEmployee(null);

        transaction = transactionRepository.save(transaction);

        int totalItemsSold = 0;

        for (OrderLine line : lines) {
            // Find items with status OCZEKUJE_NA_ODBIOR for this product in the pickup
            // store
            List<ProductItem> readyItems = productItemRepository.findAvailableItemsInStore(
                    line.getProduct().getProductId(),
                    order.getPickupStore().getStoreId(),
                    ProductStatus.OCZEKUJE_NA_ODBIOR);

            int quantityNeeded = line.getQuantity();
            int sold = 0;

            for (ProductItem item : readyItems) {
                if (sold >= quantityNeeded)
                    break;

                // Check if this item is not already sold
                if (item.getCurrentStatus() == ProductStatus.OCZEKUJE_NA_ODBIOR) {
                    // Create transaction item
                    TransactionItem txItem = new TransactionItem();
                    txItem.setTransaction(transaction);
                    txItem.setItem(item);
                    txItem.setPriceSold(line.getPriceAtOrder());
                    transactionItemRepository.save(txItem);

                    // Mark as sold
                    item.setCurrentStatus(ProductStatus.SPRZEDANY);
                    productItemRepository.save(item);
                    sold++;
                    totalItemsSold++;
                    System.out.println(
                            "Item " + item.getItemId() + " marked as sold for product " + line.getProduct().getName());
                }
            }

            if (sold < quantityNeeded) {
                System.out.println("Warning: Only sold " + sold + " of " + quantityNeeded + " for product "
                        + line.getProduct().getName());
            }
        }

        System.out.println("Transaction complete. Total items sold: " + totalItemsSold);
    }

    private void releaseReservedItems(CustomerOrder order) {
        List<OrderLine> lines = orderLineRepository.findByOrderOrderId(order.getOrderId());

        for (OrderLine line : lines) {
            // Find reserved items for this product
            List<ProductItem> reservedItems = productItemRepository.findAvailableItemsInStore(
                    line.getProduct().getProductId(),
                    order.getPickupStore().getStoreId(),
                    ProductStatus.ZAREZERWOWANY);

            // Also find items waiting for pickup
            List<ProductItem> waitingItems = productItemRepository.findAvailableItemsInStore(
                    line.getProduct().getProductId(),
                    order.getPickupStore().getStoreId(),
                    ProductStatus.OCZEKUJE_NA_ODBIOR);

            int quantityToRelease = line.getQuantity();
            int released = 0;

            // Release reserved items first
            for (ProductItem item : reservedItems) {
                if (released >= quantityToRelease)
                    break;
                item.setCurrentStatus(ProductStatus.NA_STANIE);
                productItemRepository.save(item);
                released++;
            }

            // Then release waiting items if needed
            for (ProductItem item : waitingItems) {
                if (released >= quantityToRelease)
                    break;
                item.setCurrentStatus(ProductStatus.NA_STANIE);
                productItemRepository.save(item);
                released++;
            }
        }
    }

    public OrderAvailabilityDTO checkOrderAvailability(Integer pickupStoreId, CreateOrderRequest request) {
        Store pickupStore = storeRepository.findById(pickupStoreId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + pickupStoreId));

        List<OrderAvailabilityDTO.ProductAvailability> productAvailabilities = new ArrayList<>();
        boolean allAvailable = true;

        for (CreateOrderRequest.OrderLineRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + lineReq.getProductId()));

            // Check availability in pickup store
            List<ProductItem> itemsInPickupStore = productItemRepository.findAvailableItemsInStore(
                    product.getProductId(),
                    pickupStoreId,
                    ProductStatus.NA_STANIE);

            int availableInPickupStore = itemsInPickupStore.size();
            boolean productAvailable = availableInPickupStore >= lineReq.getQuantity();

            // If not enough in pickup store, check other stores
            Map<Integer, OrderAvailabilityDTO.ProductAvailability.StoreStock> alternativeStores = new HashMap<>();
            if (!productAvailable) {
                List<ProductStatus> availableStatuses = Arrays.asList(ProductStatus.NA_STANIE,
                        ProductStatus.NA_EKSPOZYCJI);
                List<Object[]> storeStocks = productItemRepository.countAvailableByStore(product.getProductId(),
                        availableStatuses);

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
                                    count.intValue()));
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
                    productAvailable));

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
        boolean hasShortage = false;

        // Check for shortages if order status is NOWE
        if (order.getStatus() == OrderStatus.NOWE) {
            for (OrderLine line : lines) {
                long availableCount = productItemRepository.countByProductProductIdAndStoreStoreIdAndCurrentStatus(
                        line.getProduct().getProductId(),
                        order.getPickupStore().getStoreId(),
                        ProductStatus.NA_STANIE);

                if (availableCount < line.getQuantity()) {
                    hasShortage = true;
                    break;
                }
            }
        }

        List<OrderDTO.OrderLineDTO> lineDTOs = lines.stream()
                .map(line -> {
                    BigDecimal lineTotal = line.getPriceAtOrder().multiply(BigDecimal.valueOf(line.getQuantity()));
                    return new OrderDTO.OrderLineDTO(
                            line.getOrderLineId(),
                            line.getProduct().getProductId(),
                            line.getProduct().getName(),
                            line.getQuantity(),
                            line.getPriceAtOrder(),
                            lineTotal);
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
                hasShortage,
                lineDTOs);
    }
}
