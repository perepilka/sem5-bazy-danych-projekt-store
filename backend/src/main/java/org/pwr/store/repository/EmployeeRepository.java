package org.pwr.store.repository;

import org.pwr.store.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByLogin(String login);
    boolean existsByLogin(String login);
    
    List<Employee> findByStoreStoreId(Integer storeId);
    long countByStoreStoreId(Integer storeId);
}
