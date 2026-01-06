package org.pwr.store.repository;

import org.pwr.store.model.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderLineRepository extends JpaRepository<OrderLine, Integer> {
    
    List<OrderLine> findByOrderOrderId(Integer orderId);
    
    void deleteByOrderOrderId(Integer orderId);
}
