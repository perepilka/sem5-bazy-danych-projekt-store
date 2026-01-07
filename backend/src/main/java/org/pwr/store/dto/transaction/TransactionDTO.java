package org.pwr.store.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Integer transactionId;
    private Integer employeeId;
    private String employeeName;
    private Integer customerId;
    private String customerName;
    private Integer orderId;
    private LocalDateTime transactionDate;
    private String documentType;
    private BigDecimal totalAmount;
    private List<TransactionItemDTO> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionItemDTO {
        private Integer txItemId;
        private Integer itemId;
        private Integer productId;
        private String productName;
        private BigDecimal priceSold;
    }
}
