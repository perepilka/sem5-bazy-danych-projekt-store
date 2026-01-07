package org.pwr.store.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Integer orderId;
    private Integer customerId;
    private String customerName;
    private Integer pickupStoreId;
    private String pickupStoreName;
    private String pickupStoreCity;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    private List<OrderLineDTO> lines;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderLineDTO {
        private Integer orderLineId;
        private Integer productId;
        private String productName;
        private Integer quantity;
        private BigDecimal priceAtOrder;
        private BigDecimal lineTotal;
    }
}
