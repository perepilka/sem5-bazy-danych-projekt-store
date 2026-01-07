package org.pwr.store.dto.returns;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReturnStatusRequest {
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "ROZPATRYWANY|PRZYJETY|ODRZUCONY", 
             message = "Status must be ROZPATRYWANY, PRZYJETY, or ODRZUCONY")
    private String status;
}
