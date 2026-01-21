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
    
    @Query("SELECT pi FROM ProductItem pi " +
           "JOIN FETCH pi.product p " +
           "JOIN FETCH p.category " +
           "WHERE pi.store.storeId = :storeId")
    List<ProductItem> findByStoreStoreIdWithProduct(@Param("storeId") Integer storeId);
    
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

    @Query("SELECT pi FROM ProductItem pi " +
           "JOIN OrderLine ol ON ol.product.productId = pi.product.productId " +
           "WHERE ol.order.orderId = :orderId " +
           "AND pi.store.storeId = (SELECT o.pickupStore.storeId FROM CustomerOrder o WHERE o.orderId = :orderId) " +
           "AND (pi.currentStatus = 'ZAREZERWOWANY' OR pi.currentStatus = 'OCZEKUJE_NA_ODBIOR') " +
           "AND pi.itemId NOT IN (SELECT ti.item.itemId FROM TransactionItem ti)")
    List<ProductItem> findReservedItemsForOrder(@Param("orderId") Integer orderId);
    
    long countByProductProductIdAndStoreStoreIdAndCurrentStatus(
        Integer productId, 
        Integer storeId, 
        ProductStatus status
    );
}
