package org.pwr.store.repository;

import org.pwr.store.model.Employee;
import org.pwr.store.model.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByLogin(String login);
    boolean existsByLogin(String login);
    
    List<Employee> findByStoreStoreId(Integer storeId);
    Page<Employee> findByStoreStoreId(Integer storeId, Pageable pageable);
    Page<Employee> findByPosition(UserRole position, Pageable pageable);
    long countByStoreStoreId(Integer storeId);
    
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.store WHERE e.employeeId IN :ids")
    List<Employee> findByIdsWithStore(@Param("ids") List<Integer> ids);
}
