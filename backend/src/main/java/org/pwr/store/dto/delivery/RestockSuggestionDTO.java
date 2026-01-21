package org.pwr.store.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestockSuggestionDTO {
    private Integer storeId;
    private String storeName;
    private String storeCity;
    private List<ProductRequest> neededProducts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRequest {
        private Integer productId;
        private String productName;
        private Integer quantityNeeded;
        private Integer currentStock;
    }
}
