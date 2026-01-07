package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.delivery.CreateDeliveryRequest;
import org.pwr.store.dto.delivery.DeliveryDTO;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.*;
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
        delivery = deliveryRepository.save(delivery);

        // Create delivery lines and product items
        List<DeliveryLine> lines = new ArrayList<>();
        for (CreateDeliveryRequest.DeliveryLineRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lineReq.getProductId()));

            // Create delivery line
            DeliveryLine line = new DeliveryLine();
            line.setDelivery(delivery);
            line.setProduct(product);
            line.setQuantity(lineReq.getQuantity());
            line.setPurchasePrice(lineReq.getPurchasePrice());
            line = deliveryLineRepository.save(line);
            lines.add(line);

            // Create product items (individual instances)
            Store store = null;
            if (lineReq.getStoreId() != null) {
                store = storeRepository.findById(lineReq.getStoreId())
                        .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + lineReq.getStoreId()));
            }

            for (int i = 0; i < lineReq.getQuantity(); i++) {
                ProductItem item = new ProductItem();
                item.setProduct(product);
                item.setDeliveryId(delivery.getDeliveryId());
                item.setStore(store);
                item.setCurrentStatus(ProductStatus.NA_STANIE);
                productItemRepository.save(item);
            }
        }

        return toDTO(delivery);
    }

    @Transactional
    public DeliveryDTO updateDeliveryStatus(Integer id, String status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + id));
        
        delivery.setStatus(status);
        delivery = deliveryRepository.save(delivery);
        return toDTO(delivery);
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
                            total
                    );
                })
                .collect(Collectors.toList());

        return new DeliveryDTO(
                delivery.getDeliveryId(),
                delivery.getSupplierName(),
                delivery.getDeliveryDate(),
                delivery.getStatus(),
                lineDTOs
        );
    }
}
