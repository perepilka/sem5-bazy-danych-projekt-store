package org.pwr.store.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Pickup store ID is required")
    private Integer pickupStoreId;

    @NotNull(message = "Order lines are required")
    @Size(min = 1, message = "At least one product is required")
    @Valid
    private List<OrderLineRequest> lines;

    private Boolean ignoreAvailability;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderLineRequest {

        @NotNull(message = "Product ID is required")
        private Integer productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
