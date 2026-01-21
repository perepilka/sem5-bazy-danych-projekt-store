package org.pwr.store.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Integer employeeId;
    private Integer storeId;
    private String storeName;
    private String firstName;
    private String lastName;
    private String position;
    private String login;
    private Boolean isActive;
}
