package org.pwr.store.repository;

import org.pwr.store.model.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, Integer> {
    
    List<ReturnItem> findByReturnRequestReturnId(Integer returnId);
    
    List<ReturnItem> findByItemItemId(Integer itemId);
}
