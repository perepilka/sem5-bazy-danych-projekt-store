package org.pwr.store.dto.transaction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
    
    @NotNull(message = "Employee ID is required")
    private Integer employeeId;
    
    private Integer customerId;
    
    private Integer orderId;
    
    @NotNull(message = "Document type is required")
    @Pattern(regexp = "PARAGON|FAKTURA", message = "Document type must be PARAGON or FAKTURA")
    private String documentType;
    
    @NotNull(message = "Transaction items are required")
    @Size(min = 1, message = "At least one item is required")
    @Valid
    private List<TransactionItemRequest> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionItemRequest {
        
        @NotNull(message = "Item ID is required")
        private Integer itemId;
        
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        private BigDecimal priceSold;
    }
}
