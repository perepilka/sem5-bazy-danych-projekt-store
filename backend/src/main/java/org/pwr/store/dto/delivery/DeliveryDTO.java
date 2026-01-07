package org.pwr.store.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDTO {
    private Integer deliveryId;
    private String supplierName;
    private LocalDate deliveryDate;
    private String status;
    private List<DeliveryLineDTO> lines;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryLineDTO {
        private Integer deliveryLineId;
        private Integer productId;
        private String productName;
        private Integer quantity;
        private BigDecimal purchasePrice;
        private BigDecimal totalPrice;
    }
}
