// ==================== AUTH ====================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userType: 'CUSTOMER' | 'EMPLOYEE';
  username: string;
  role?: 'KIEROWNIK' | 'SPRZEDAWCA' | 'MAGAZYNIER';
  storeId?: number;
}

// ==================== PRODUCTS ====================
export interface ProductDTO {
  productId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  basePrice: number;
  lowStockThreshold?: number;
  minimumStock?: number;
  isActive?: boolean;
}

export interface CreateProductRequest {
  categoryId: number;
  name: string;
  description?: string;
  basePrice: number;
  lowStockThreshold?: number;
  minimumStock?: number;
}

export interface ProductAvailabilityDTO {
  productId: number;
  productName: string;
  storeAvailability: Record<string, StoreAvailability>;
}

export interface StoreAvailability {
  storeId: number;
  storeName: string;
  city: string;
  availableCount: number;
}

// ==================== CATEGORIES ====================
export interface CategoryDTO {
  categoryId: number;
  name: string;
  description: string;
}

// ==================== STORES ====================
export interface StoreDTO {
  storeId: number;
  address: string;
  city: string;
  phoneNumber: string;
  employeeCount: number;
  productCount: number;
}

export interface StoreInventoryDTO {
  productId: number;
  productName: string;
  categoryName: string;
  availableCount: number;
  onDisplayCount: number;
  reservedCount: number;
  totalCount: number;
}

export interface LowStockItemDTO {
  productId: number;
  productName: string;
  storeId: number;
  storeName: string;
  currentStock: number;
  lowStockThreshold: number;
  minimumStock: number;
  quantityNeeded: number;
}

// ==================== ORDERS ====================
export interface OrderDTO {
  orderId: number;
  customerId: number;
  customerName: string;
  pickupStoreId: number;
  pickupStoreName: string;
  pickupStoreCity: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  hasShortage?: boolean;
  lines: OrderLineDTO[];
}

export interface OrderLineDTO {
  orderLineId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
  lineTotal: number;
}

export interface CreateOrderRequest {
  pickupStoreId: number;
  lines: OrderLineRequest[];
  ignoreAvailability?: boolean;
}

export interface OrderLineRequest {
  productId: number;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: 'ZATWIERDZONY' | 'ANULOWANY' | 'GOTOWY_DO_ODBIORU' | 'ODEBRANY';
}

export interface OrderAvailabilityDTO {
  products: ProductAvailability[];
  allAvailable: boolean;
  message: string;
}

export interface ProductAvailability {
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableInPickupStore: number;
  alternativeStores: Record<string, StoreStock>;
  available: boolean;
}

export interface StoreStock {
  storeId: number;
  storeName: string;
  city: string;
  availableQuantity: number;
}

export interface RestockSuggestionDTO {
  storeId: number;
  storeName: string;
  storeCity: string;
  neededProducts: ProductRequest[];
}

export interface ProductRequest {
  productId: number;
  productName: string;
  quantityNeeded: number;
  currentStock: number;
}

// ==================== DELIVERIES ====================
export interface DeliveryDTO {
  deliveryId: number;
  supplierName: string;
  deliveryDate: string;
  status: string;
  lines: DeliveryLineDTO[];
}

export interface DeliveryLineDTO {
  deliveryLineId: number;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalPrice: number;
}

export interface CreateDeliveryRequest {
  supplierName: string;
  deliveryDate: string;
  lines: DeliveryLineRequest[];
}

export interface DeliveryLineRequest {
  productId: number;
  quantity: number;
  purchasePrice: number;
  storeId?: number;
}

export interface UpdateDeliveryStatusRequest {
  status: 'W_TRAKCIE' | 'ZREALIZOWANA' | 'ANULOWANA';
}

// ==================== TRANSACTIONS ====================
export interface TransactionDTO {
  transactionId: number;
  storeId: number;
  storeName: string;
  employeeId?: number;
  employeeName?: string;
  customerId?: number;
  customerName?: string;
  transactionDate: string;
  totalAmount: number;
  transactionType: string;
  items: TransactionItemDTO[];
}

export interface TransactionItemDTO {
  transactionItemId: number;
  itemId: number;
  productId: number;
  productName: string;
  price: number;
}

// ==================== RETURNS ====================
export interface ReturnDTO {
  returnId: number;
  transactionId: number;
  returnDate: string;
  reason: string;
  status: 'ROZPATRYWANY' | 'PRZYJETY' | 'ODRZUCONY';
  items: ReturnItemDTO[];
}

export interface ReturnItemDTO {
  returnItemId: number;
  itemId: number;
  productId: number;
  productName: string;
  conditionCheck: string;
}

export interface UpdateReturnStatusRequest {
  status: 'ROZPATRYWANY' | 'PRZYJETY' | 'ODRZUCONY';
}

// ==================== PAGINATION ====================
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageableParams {
  page?: number;
  size?: number;
}

// ==================== ERROR ====================
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
