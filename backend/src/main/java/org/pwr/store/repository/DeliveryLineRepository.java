package org.pwr.store.repository;

import org.pwr.store.model.DeliveryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryLineRepository extends JpaRepository<DeliveryLine, Integer> {
    
    List<DeliveryLine> findByDeliveryDeliveryId(Integer deliveryId);
    
    List<DeliveryLine> findByProductProductId(Integer productId);
}
