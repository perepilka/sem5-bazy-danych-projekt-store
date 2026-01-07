package org.pwr.store.dto.delivery;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeliveryRequest {
    
    @Size(max = 100, message = "Supplier name must not exceed 100 characters")
    private String supplierName;
    
    private LocalDate deliveryDate;
    
    @NotNull(message = "Delivery lines are required")
    @Size(min = 1, message = "At least one delivery line is required")
    @Valid
    private List<DeliveryLineRequest> lines;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryLineRequest {
        
        @NotNull(message = "Product ID is required")
        private Integer productId;
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
        
        @NotNull(message = "Purchase price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        private BigDecimal purchasePrice;
        
        private Integer storeId;
    }
}
