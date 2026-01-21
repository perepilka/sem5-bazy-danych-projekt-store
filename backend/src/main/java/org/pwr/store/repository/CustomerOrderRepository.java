package org.pwr.store.repository;

import org.pwr.store.model.CustomerOrder;
import org.pwr.store.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Integer> {

    Page<CustomerOrder> findByCustomerCustomerId(Integer customerId, Pageable pageable);

    Page<CustomerOrder> findByStatus(OrderStatus status, Pageable pageable);

    Page<CustomerOrder> findByPickupStoreStoreId(Integer storeId, Pageable pageable);

    Page<CustomerOrder> findByPickupStoreStoreIdAndStatus(Integer storeId, OrderStatus status, Pageable pageable);

    Page<CustomerOrder> findByPickupStoreStoreIdAndStatusIn(Integer storeId, List<OrderStatus> statuses,
            Pageable pageable);

    Page<CustomerOrder> findByStatusIn(List<OrderStatus> statuses, Pageable pageable);

    @Query("SELECT co FROM CustomerOrder co WHERE co.customer.customerId = :customerId AND co.status = :status")
    List<CustomerOrder> findByCustomerAndStatus(@Param("customerId") Integer customerId,
            @Param("status") OrderStatus status);

    @Query("SELECT co FROM CustomerOrder co WHERE co.pickupStore.storeId = :storeId AND co.status IN :statuses")
    Page<CustomerOrder> findPendingOrdersByStore(
            @Param("storeId") Integer storeId,
            @Param("statuses") List<OrderStatus> statuses,
            Pageable pageable);
}
