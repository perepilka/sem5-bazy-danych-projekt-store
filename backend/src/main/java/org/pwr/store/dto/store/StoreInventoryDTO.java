package org.pwr.store.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreInventoryDTO {
    private Integer productId;
    private String productName;
    private String categoryName;
    private Integer availableCount;
    private Integer onDisplayCount;
    private Integer reservedCount;
    private Integer totalCount;
}
