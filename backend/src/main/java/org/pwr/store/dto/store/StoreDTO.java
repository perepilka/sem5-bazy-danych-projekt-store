package org.pwr.store.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreDTO {
    private Integer storeId;
    private String address;
    private String city;
    private String phoneNumber;
    private Integer employeeCount;
    private Integer productCount;
}
