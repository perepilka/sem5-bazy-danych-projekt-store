package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.employee.CreateEmployeeRequest;
import org.pwr.store.dto.employee.EmployeeDTO;
import org.pwr.store.dto.employee.UpdateEmployeeRequest;
import org.pwr.store.exception.ResourceAlreadyExistsException;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.Employee;
import org.pwr.store.model.Store;
import org.pwr.store.model.enums.UserRole;
import org.pwr.store.repository.EmployeeRepository;
import org.pwr.store.repository.StoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<EmployeeDTO> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDTO> getEmployeesByStore(Integer storeId, Pageable pageable) {
        return employeeRepository.findByStoreStoreId(storeId, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDTO> getEmployeesByPosition(String position, Pageable pageable) {
        try {
            UserRole role = UserRole.valueOf(position.toUpperCase());
            return employeeRepository.findByPosition(role, pageable).map(this::toDTO);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid position: " + position);
        }
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return toDTO(employee);
    }

    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        // Check if login already exists
        Optional<Employee> existing = employeeRepository.findByLogin(request.getLogin());
        if (existing.isPresent()) {
            throw new ResourceAlreadyExistsException("Employee with login '" + request.getLogin() + "' already exists");
        }

        // Validate store exists
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        // Validate position
        UserRole position;
        try {
            position = UserRole.valueOf(request.getPosition().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid position: " + request.getPosition() + 
                ". Valid values are: KIEROWNIK, SPRZEDAWCA, MAGAZYNIER");
        }

        // Create employee
        Employee employee = new Employee();
        employee.setStore(store);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPosition(position);
        employee.setLogin(request.getLogin());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        employee.setIsActive(true);

        employee = employeeRepository.save(employee);
        return toDTO(employee);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Integer id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // Update store if provided
        if (request.getStoreId() != null) {
            Store store = storeRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));
            employee.setStore(store);
        }

        // Update fields if provided
        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }
        if (request.getPosition() != null) {
            try {
                UserRole position = UserRole.valueOf(request.getPosition().toUpperCase());
                employee.setPosition(position);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid position: " + request.getPosition());
            }
        }
        if (request.getIsActive() != null) {
            employee.setIsActive(request.getIsActive());
        }

        employee = employeeRepository.save(employee);
        return toDTO(employee);
    }

    @Transactional
    public EmployeeDTO toggleEmployeeStatus(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        employee.setIsActive(!employee.getIsActive());
        employee = employeeRepository.save(employee);
        return toDTO(employee);
    }

    @Transactional
    public void deleteEmployee(Integer id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    private EmployeeDTO toDTO(Employee employee) {
        String storeName = null;
        Integer storeId = null;
        if (employee.getStore() != null) {
            storeId = employee.getStore().getStoreId();
            storeName = employee.getStore().getCity() + " - " + employee.getStore().getAddress();
        }

        return new EmployeeDTO(
                employee.getEmployeeId(),
                storeId,
                storeName,
                employee.getFirstName(),
                employee.getLastName(),
                employee.getPosition().name(),
                employee.getLogin(),
                employee.getIsActive()
        );
    }
}
