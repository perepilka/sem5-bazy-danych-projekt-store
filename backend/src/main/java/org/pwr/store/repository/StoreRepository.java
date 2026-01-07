package org.pwr.store.repository;

import org.pwr.store.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Integer> {
    
    List<Store> findByCity(String city);
    
    List<Store> findByCityContainingIgnoreCase(String city);
    
    @Query("SELECT s FROM Store s WHERE LOWER(s.address) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.city) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Store> searchStores(@Param("search") String search);
    
    Optional<Store> findByAddressAndCity(String address, String city);
}
