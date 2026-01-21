package org.pwr.store.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LowStockItemDTO {
    private Integer productId;
    private String productName;
    private Integer storeId;
    private String storeName;
    private Integer currentStock;
    private Integer lowStockThreshold;
    private Integer minimumStock;
    private Integer quantityNeeded;
}
