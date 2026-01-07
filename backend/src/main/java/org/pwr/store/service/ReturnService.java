package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.returns.CreateReturnRequest;
import org.pwr.store.dto.returns.ReturnDTO;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.*;
import org.pwr.store.model.enums.ProductStatus;
import org.pwr.store.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final ReturnItemRepository returnItemRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;
    private final ProductItemRepository productItemRepository;

    public Page<ReturnDTO> getAllReturns(Pageable pageable) {
        return returnRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<ReturnDTO> getReturnsByStatus(String status, Pageable pageable) {
        return returnRepository.findByStatus(status, pageable).map(this::toDTO);
    }

    public Page<ReturnDTO> getReturnsByTransaction(Integer transactionId, Pageable pageable) {
        return returnRepository.findByTransactionTransactionId(transactionId, pageable).map(this::toDTO);
    }

    public ReturnDTO getReturnById(Integer id) {
        Return returnRequest = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found with id: " + id));
        return toDTO(returnRequest);
    }

    @Transactional
    public ReturnDTO createReturn(CreateReturnRequest request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + request.getTransactionId()));

        // Verify that all items belong to the transaction
        List<TransactionItem> transactionItems = transactionItemRepository.findByTransactionTransactionId(transaction.getTransactionId());
        List<Integer> transactionItemIds = transactionItems.stream()
                .map(ti -> ti.getItem().getItemId())
                .collect(Collectors.toList());

        for (CreateReturnRequest.ReturnItemRequest itemReq : request.getItems()) {
            if (!transactionItemIds.contains(itemReq.getItemId())) {
                throw new IllegalStateException("Item " + itemReq.getItemId() + " was not part of transaction " + transaction.getTransactionId());
            }

            ProductItem item = productItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemReq.getItemId()));

            if (item.getCurrentStatus() != ProductStatus.SPRZEDANY) {
                throw new IllegalStateException("Item " + itemReq.getItemId() + " has not been sold, cannot be returned");
            }
        }

        // Create return
        Return returnRequest = new Return();
        returnRequest.setTransaction(transaction);
        returnRequest.setReturnDate(LocalDateTime.now());
        returnRequest.setReason(request.getReason());
        returnRequest.setStatus("ROZPATRYWANY");

        returnRequest = returnRepository.save(returnRequest);

        // Create return items
        for (CreateReturnRequest.ReturnItemRequest itemReq : request.getItems()) {
            ProductItem item = productItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemReq.getItemId()));

            ReturnItem returnItem = new ReturnItem();
            returnItem.setReturnRequest(returnRequest);
            returnItem.setItem(item);
            returnItem.setConditionCheck(itemReq.getConditionCheck());
            returnItemRepository.save(returnItem);
        }

        return toDTO(returnRequest);
    }

    @Transactional
    public ReturnDTO updateReturnStatus(Integer id, String status) {
        Return returnRequest = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found with id: " + id));

        String oldStatus = returnRequest.getStatus();
        returnRequest.setStatus(status);
        returnRequest = returnRepository.save(returnRequest);

        // If return is accepted, update product item statuses
        if ("PRZYJETY".equals(status) && !"PRZYJETY".equals(oldStatus)) {
            List<ReturnItem> returnItems = returnItemRepository.findByReturnRequestReturnId(id);
            
            for (ReturnItem returnItem : returnItems) {
                ProductItem item = returnItem.getItem();
                
                // Determine new status based on condition check
                String condition = returnItem.getConditionCheck().toLowerCase();
                if (condition.contains("uszkodzon") || condition.contains("usterka") || 
                    condition.contains("damaged") || condition.contains("defect")) {
                    item.setCurrentStatus(ProductStatus.USZKODZONY);
                } else {
                    item.setCurrentStatus(ProductStatus.NA_STANIE);
                }
                
                productItemRepository.save(item);
            }
        }

        return toDTO(returnRequest);
    }

    @Transactional
    public void deleteReturn(Integer id) {
        if (!returnRepository.existsById(id)) {
            throw new ResourceNotFoundException("Return not found with id: " + id);
        }
        returnRepository.deleteById(id);
    }

    private ReturnDTO toDTO(Return returnRequest) {
        List<ReturnItem> items = returnItemRepository.findByReturnRequestReturnId(returnRequest.getReturnId());

        List<ReturnDTO.ReturnItemDTO> itemDTOs = items.stream()
                .map(item -> new ReturnDTO.ReturnItemDTO(
                        item.getReturnItemId(),
                        item.getItem().getItemId(),
                        item.getItem().getProduct().getProductId(),
                        item.getItem().getProduct().getName(),
                        item.getConditionCheck()
                ))
                .collect(Collectors.toList());

        return new ReturnDTO(
                returnRequest.getReturnId(),
                returnRequest.getTransaction().getTransactionId(),
                returnRequest.getReturnDate(),
                returnRequest.getReason(),
                returnRequest.getStatus(),
                itemDTOs
        );
    }
}
