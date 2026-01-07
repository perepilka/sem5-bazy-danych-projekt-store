package org.pwr.store.dto.returns;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnDTO {
    private Integer returnId;
    private Integer transactionId;
    private LocalDateTime returnDate;
    private String reason;
    private String status;
    private List<ReturnItemDTO> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemDTO {
        private Integer returnItemId;
        private Integer itemId;
        private Integer productId;
        private String productName;
        private String conditionCheck;
    }
}
