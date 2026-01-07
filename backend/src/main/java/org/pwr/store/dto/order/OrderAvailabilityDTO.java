package org.pwr.store.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderAvailabilityDTO {
    private List<ProductAvailability> products;
    private boolean allAvailable;
    private String message;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductAvailability {
        private Integer productId;
        private String productName;
        private Integer requestedQuantity;
        private Integer availableInPickupStore;
        private Map<Integer, StoreStock> alternativeStores;
        private boolean available;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class StoreStock {
            private Integer storeId;
            private String storeName;
            private String city;
            private Integer availableQuantity;
        }
    }
}
