package org.pwr.store.repository;

import org.pwr.store.model.Return;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Integer> {
    
    Page<Return> findByStatus(String status, Pageable pageable);
    
    Page<Return> findByTransactionTransactionId(Integer transactionId, Pageable pageable);
    
    List<Return> findByReturnDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
