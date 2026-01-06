package org.pwr.store.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Integer productId;
    private Integer categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal basePrice;
}
