package org.pwr.store.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.pwr.store.model.Delivery;
import org.pwr.store.repository.DeliveryRepository;
import org.pwr.store.service.DeliveryService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryStatusScheduler {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryService deliveryService;

    // Runs every 2 seconds
    @Scheduled(fixedRate = 2000)
    @Transactional
    public void updateDeliveryStatuses() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find only deliveries that are not in final status
        List<Delivery> deliveries = deliveryRepository.findAll().stream()
                .filter(d -> !"ZREALIZOWANA".equals(d.getStatus()) && !"ANULOWANA".equals(d.getStatus()))
                .toList();
        
        if (deliveries.isEmpty()) {
            return;
        }
        
        for (Delivery delivery : deliveries) {
            if (delivery.getCreatedAt() == null) {
                continue;
            }
            
            long secondsSinceCreation = java.time.Duration.between(delivery.getCreatedAt(), now).getSeconds();
            String currentStatus = delivery.getStatus();
            String newStatus = null;
            
            // Status progression: PRZYJETA -> W_TRAKCIE -> ZREALIZOWANA
            // Each stage lasts 5 seconds
            if ("PRZYJETA".equals(currentStatus) && secondsSinceCreation >= 5) {
                newStatus = "W_TRAKCIE";
            } else if ("W_TRAKCIE".equals(currentStatus) && secondsSinceCreation >= 10) {
                newStatus = "ZREALIZOWANA";
            }
            
            if (newStatus != null && !newStatus.equals(currentStatus)) {
                // Use service method to update status (triggers product item creation)
                try {
                    deliveryService.updateDeliveryStatus(delivery.getDeliveryId(), newStatus);
                    log.info("Updated delivery {} status from {} to {}", 
                        delivery.getDeliveryId(), currentStatus, newStatus);
                } catch (Exception e) {
                    log.error("Failed to update delivery {} status: {}", delivery.getDeliveryId(), e.getMessage());
                }
            }
        }
    }
}
