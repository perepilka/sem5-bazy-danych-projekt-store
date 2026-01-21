package org.pwr.store.repository;

import org.pwr.store.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    Page<Transaction> findByEmployeeEmployeeId(Integer employeeId, Pageable pageable);

    Page<Transaction> findByCustomerCustomerId(Integer customerId, Pageable pageable);

    Page<Transaction> findByOrderOrderId(Integer orderId, Pageable pageable);

    Page<Transaction> findByDocumentType(String documentType, Pageable pageable);

    List<Transaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t LEFT JOIN t.order o LEFT JOIN t.employee e WHERE o.pickupStore.storeId = :storeId OR e.store.storeId = :storeId")
    Page<Transaction> findByStoreId(@org.springframework.data.repository.query.Param("storeId") Integer storeId,
            Pageable pageable);
}
