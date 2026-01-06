package org.pwr.store.repository;

import org.pwr.store.model.Delivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {
    
    Page<Delivery> findByStatus(String status, Pageable pageable);
    
    List<Delivery> findByDeliveryDateBetween(LocalDate startDate, LocalDate endDate);
    
    Page<Delivery> findBySupplierNameContainingIgnoreCase(String supplierName, Pageable pageable);
}
