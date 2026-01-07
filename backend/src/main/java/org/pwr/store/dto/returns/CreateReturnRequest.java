package org.pwr.store.dto.returns;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReturnRequest {
    
    @NotNull(message = "Transaction ID is required")
    private Integer transactionId;
    
    @NotBlank(message = "Return reason is required")
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
    
    @NotNull(message = "Return items are required")
    @Size(min = 1, message = "At least one item is required")
    @Valid
    private List<ReturnItemRequest> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemRequest {
        
        @NotNull(message = "Item ID is required")
        private Integer itemId;
        
        @NotBlank(message = "Condition check is required")
        @Size(max = 50, message = "Condition check must not exceed 50 characters")
        private String conditionCheck;
    }
}
