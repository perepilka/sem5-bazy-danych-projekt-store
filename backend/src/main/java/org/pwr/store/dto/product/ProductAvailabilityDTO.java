package org.pwr.store.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAvailabilityDTO {
    private Integer productId;
    private String productName;
    private Map<Integer, StoreAvailability> storeAvailability;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreAvailability {
        private Integer storeId;
        private String storeName;
        private String city;
        private Long availableCount;
    }
}
