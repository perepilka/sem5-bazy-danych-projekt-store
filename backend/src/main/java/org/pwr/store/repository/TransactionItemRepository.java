package org.pwr.store.repository;

import org.pwr.store.model.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionItemRepository extends JpaRepository<TransactionItem, Integer> {
    
    List<TransactionItem> findByTransactionTransactionId(Integer transactionId);
    
    List<TransactionItem> findByItemItemId(Integer itemId);
}
