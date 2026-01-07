package org.pwr.store.repository;

import org.pwr.store.model.ProductItem;
import org.pwr.store.model.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Integer> {
    
    List<ProductItem> findByProductProductId(Integer productId);
    
    List<ProductItem> findByStoreStoreId(Integer storeId);
    
    long countByStoreStoreId(Integer storeId);
    
    List<ProductItem> findByProductProductIdAndCurrentStatus(Integer productId, ProductStatus status);
    
    @Query("SELECT pi FROM ProductItem pi WHERE pi.product.productId = :productId " +
           "AND pi.store.storeId = :storeId AND pi.currentStatus = :status")
    List<ProductItem> findAvailableItemsInStore(
        @Param("productId") Integer productId,
        @Param("storeId") Integer storeId,
        @Param("status") ProductStatus status
    );
    
    @Query("SELECT pi.store.storeId, COUNT(pi) FROM ProductItem pi " +
           "WHERE pi.product.productId = :productId AND pi.currentStatus IN :statuses " +
           "GROUP BY pi.store.storeId")
    List<Object[]> countAvailableByStore(
        @Param("productId") Integer productId,
        @Param("statuses") List<ProductStatus> statuses
    );
}
