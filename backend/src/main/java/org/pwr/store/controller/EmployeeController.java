package org.pwr.store.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.employee.CreateEmployeeRequest;
import org.pwr.store.dto.employee.EmployeeDTO;
import org.pwr.store.dto.employee.UpdateEmployeeRequest;
import org.pwr.store.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<Page<EmployeeDTO>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String position) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("lastName", "firstName"));
        
        Page<EmployeeDTO> employees;
        if (storeId != null) {
            employees = employeeService.getEmployeesByStore(storeId, pageable);
        } else if (position != null) {
            employees = employeeService.getEmployeesByPosition(position, pageable);
        } else {
            employees = employeeService.getAllEmployees(pageable);
        }
        
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Integer id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeDTO employee = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(employee);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<EmployeeDTO> updateEmployee(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<EmployeeDTO> toggleEmployeeStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(employeeService.toggleEmployeeStatus(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('KIEROWNIK')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Integer id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
