package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.transaction.CreateTransactionRequest;
import org.pwr.store.dto.transaction.TransactionDTO;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final CustomerOrderRepository orderRepository;
    private final ProductItemRepository productItemRepository;

    public Page<TransactionDTO> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<TransactionDTO> getTransactionsByStore(Integer storeId, Pageable pageable) {
        return transactionRepository.findByStoreId(storeId, pageable).map(this::toDTO);
    }

    public Page<TransactionDTO> getTransactionsByEmployee(Integer employeeId, Pageable pageable) {
        return transactionRepository.findByEmployeeEmployeeId(employeeId, pageable).map(this::toDTO);
    }

    public Page<TransactionDTO> getTransactionsByCustomer(Integer customerId, Pageable pageable) {
        return transactionRepository.findByCustomerCustomerId(customerId, pageable).map(this::toDTO);
    }

    public Page<TransactionDTO> getTransactionsByDocumentType(String documentType, Pageable pageable) {
        return transactionRepository.findByDocumentType(documentType, pageable).map(this::toDTO);
    }

    public TransactionDTO getTransactionById(Integer id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return toDTO(transaction);
    }

    @Transactional
    public TransactionDTO createTransaction(CreateTransactionRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer not found with id: " + request.getCustomerId()));
        }

        CustomerOrder order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        }

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setEmployee(employee);
        transaction.setCustomer(customer);
        transaction.setOrder(order);
        transaction.setDocumentType(request.getDocumentType());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTotalAmount(BigDecimal.ZERO);

        transaction = transactionRepository.save(transaction);

        // Create transaction items and calculate total
        BigDecimal total = BigDecimal.ZERO;
        for (CreateTransactionRequest.TransactionItemRequest itemReq : request.getItems()) {
            ProductItem item = productItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product item not found with id: " + itemReq.getItemId()));

            // Verify item is available for sale
            if (item.getCurrentStatus() != ProductStatus.NA_STANIE &&
                    item.getCurrentStatus() != ProductStatus.NA_EKSPOZYCJI &&
                    item.getCurrentStatus() != ProductStatus.OCZEKUJE_NA_ODBIOR) {
                throw new IllegalStateException("Product item " + itemReq.getItemId() + " is not available for sale");
            }

            // Create transaction item
            TransactionItem txItem = new TransactionItem();
            txItem.setTransaction(transaction);
            txItem.setItem(item);
            txItem.setPriceSold(itemReq.getPriceSold());
            transactionItemRepository.save(txItem);

            // Update product item status to SPRZEDANY
            item.setCurrentStatus(ProductStatus.SPRZEDANY);
            productItemRepository.save(item);

            total = total.add(itemReq.getPriceSold());
        }

        // Update transaction total
        transaction.setTotalAmount(total);
        transaction = transactionRepository.save(transaction);

        // If linked to order, mark order as completed
        if (order != null) {
            order.setStatus(OrderStatus.ZAKONCZONE);
            orderRepository.save(order);
        }

        return toDTO(transaction);
    }

    @Transactional
    public void deleteTransaction(Integer id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    private TransactionDTO toDTO(Transaction transaction) {
        List<TransactionItem> items = transactionItemRepository
                .findByTransactionTransactionId(transaction.getTransactionId());

        List<TransactionDTO.TransactionItemDTO> itemDTOs = items.stream()
                .map(item -> new TransactionDTO.TransactionItemDTO(
                        item.getTxItemId(),
                        item.getItem().getItemId(),
                        item.getItem().getProduct().getProductId(),
                        item.getItem().getProduct().getName(),
                        item.getPriceSold()))
                .collect(Collectors.toList());

        Integer employeeId = null;
        String employeeName = null;
        Integer storeId = null;
        String storeName = "Unknown Store";

        if (transaction.getEmployee() != null) {
            employeeId = transaction.getEmployee().getEmployeeId();
            employeeName = transaction.getEmployee().getFirstName() + " " + transaction.getEmployee().getLastName();
            if (transaction.getEmployee().getStore() != null) {
                storeId = transaction.getEmployee().getStore().getStoreId();
                storeName = transaction.getEmployee().getStore().getCity() + " - "
                        + transaction.getEmployee().getStore().getAddress();
            }
        }

        if (storeId == null && transaction.getOrder() != null) {
            storeId = transaction.getOrder().getPickupStore().getStoreId();
            storeName = transaction.getOrder().getPickupStore().getCity() + " - "
                    + transaction.getOrder().getPickupStore().getAddress();
        }

        String customerName = null;
        Integer customerId = null;
        if (transaction.getCustomer() != null) {
            customerId = transaction.getCustomer().getCustomerId();
            customerName = transaction.getCustomer().getFirstName() + " " + transaction.getCustomer().getLastName();
        }

        Integer orderId = null;
        if (transaction.getOrder() != null) {
            orderId = transaction.getOrder().getOrderId();
        }

        return new TransactionDTO(
                transaction.getTransactionId(),
                storeId,
                storeName,
                employeeId,
                employeeName,
                customerId,
                customerName,
                orderId,
                transaction.getTransactionDate(),
                transaction.getDocumentType(),
                transaction.getTotalAmount(),
                itemDTOs);
    }
}
