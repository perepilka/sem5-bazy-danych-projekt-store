package org.pwr.store.service;

import lombok.RequiredArgsConstructor;
import org.pwr.store.dto.product.*;
import org.pwr.store.exception.ResourceNotFoundException;
import org.pwr.store.model.Category;
import org.pwr.store.model.Product;
import org.pwr.store.model.ProductItem;
import org.pwr.store.model.Store;
import org.pwr.store.model.enums.ProductStatus;
import org.pwr.store.repository.CategoryRepository;
import org.pwr.store.repository.ProductItemRepository;
import org.pwr.store.repository.ProductRepository;
import org.pwr.store.repository.StoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductItemRepository productItemRepository;
    private final StoreRepository storeRepository;

    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<ProductDTO> getProductsByCategory(Integer categoryId, Pageable pageable) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return productRepository.findByCategoryCategoryId(categoryId, pageable).map(this::toDTO);
    }

    public Page<ProductDTO> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable).map(this::toDTO);
    }

    public ProductDTO getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());

        product = productRepository.save(product);
        return toDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(Integer id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getName() != null) {
            product.setName(request.getName());
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        if (request.getBasePrice() != null) {
            product.setBasePrice(request.getBasePrice());
        }

        product = productRepository.save(product);
        return toDTO(product);
    }

    @Transactional
    public void deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public ProductAvailabilityDTO getProductAvailability(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        List<ProductStatus> availableStatuses = Arrays.asList(
            ProductStatus.NA_STANIE, 
            ProductStatus.NA_EKSPOZYCJI
        );

        List<Object[]> availability = productItemRepository.countAvailableByStore(productId, availableStatuses);
        
        Map<Integer, ProductAvailabilityDTO.StoreAvailability> storeAvailabilityMap = new HashMap<>();
        
        for (Object[] row : availability) {
            Integer storeId = (Integer) row[0];
            Long count = (Long) row[1];
            
            Store store = storeRepository.findById(storeId).orElse(null);
            if (store != null) {
                ProductAvailabilityDTO.StoreAvailability storeAvail = 
                    new ProductAvailabilityDTO.StoreAvailability(
                        storeId, 
                        store.getAddress(), 
                        store.getCity(), 
                        count
                    );
                storeAvailabilityMap.put(storeId, storeAvail);
            }
        }

        return new ProductAvailabilityDTO(
            product.getProductId(),
            product.getName(),
            storeAvailabilityMap
        );
    }

    private ProductDTO toDTO(Product product) {
        return new ProductDTO(
            product.getProductId(),
            product.getCategory() != null ? product.getCategory().getCategoryId() : null,
            product.getCategory() != null ? product.getCategory().getName() : null,
            product.getName(),
            product.getDescription(),
            product.getBasePrice(),
            product.getLowStockThreshold(),
            product.getMinimumStock()
        );
    }
}
