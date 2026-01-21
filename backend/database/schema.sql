-- 1. SŁOWNIKI I TYPY DANYCH
-- NOTE: We use VARCHAR instead of ENUM for better Hibernate compatibility

-- Statusy produktu: NA_STANIE, NA_EKSPOZYCJI, ZAREZERWOWANY, OCZEKUJE_NA_ODBIOR, SPRZEDANY, USZKODZONY, ZLIKWIDOWANY
-- Role pracowników: KIEROWNIK, SPRZEDAWCA, MAGAZYNIER  
-- Statusy zamówień: NOWE, W_REALIZACJI, GOTOWE_DO_ODBIORU, ZAKONCZONE, ANULOWANE


-- 2. STRUKTURA ORGANIZACYJNA

-- Placówki
CREATE TABLE Stores (
    store_id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20)
    -- Видалено: is_headquarters
);

-- Pracownicy
CREATE TABLE Employees (
    employee_id SERIAL PRIMARY KEY,
    store_id INT REFERENCES Stores(store_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);


-- 3. KLIENCI

-- Klienci (Zarejestrowani) [cite: 55, 192]
CREATE TABLE Customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 4. PRODUKTY I MAGAZYN

-- Kategorie produktów
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Katalog Produktów
CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES Categories(category_id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL, -- Cena katalogowa
    low_stock_threshold INT DEFAULT 5,   -- Поріг низького запасу
    minimum_stock INT DEFAULT 10         -- Мінімальний запас для замовлення
);

-- Dostawy - Nagłówek (Kto i kiedy przywiózł)
CREATE TABLE Deliveries (
    delivery_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(100),
    delivery_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PRZYJETA',
    store_id INT REFERENCES Stores(store_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index used by store-scoped delivery lookups
CREATE INDEX IF NOT EXISTS idx_deliveries_store_id ON Deliveries(store_id);

-- NOWA TABELA: Pozycje Dostawy (Co jest w papierach/fakturze dostawy)
-- To відповідає на ваше прохання зберігати продукти, які були в доставці
CREATE TABLE DeliveryLines (
    delivery_line_id SERIAL PRIMARY KEY,
    delivery_id INT REFERENCES Deliveries(delivery_id),
    product_id INT REFERENCES Products(product_id), -- Яку модель привезли
    quantity INT NOT NULL, -- Скільки штук за накладною
    purchase_price DECIMAL(10, 2) NOT NULL -- Ціна закупівлі (може відрізнятися від base_price)
);

-- Egzemplarze Produktów (Fizyczne sztuki na stanie)
-- Ми залишаємо тут delivery_id, щоб знати походження конкретної фізичної коробки (для гарантії)
CREATE TABLE ProductItems (
    item_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES Products(product_id),
    delivery_id INT REFERENCES Deliveries(delivery_id), 
    store_id INT REFERENCES Stores(store_id),
    current_status VARCHAR(50) DEFAULT 'NA_STANIE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 5. ZAMÓWIENIA ONLINE I OD KLIENTÓW

-- Nagłówki zamówień klientów (Online/Tel) [cite: 21, 500]
CREATE TABLE CustomerOrders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customers(customer_id), -- NULL dla zamówień telefonicznych bez konta?
    pickup_store_id INT REFERENCES Stores(store_id), -- Gdzie klient odbierze towar
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'NOWE',
    total_amount DECIMAL(10, 2) -- Wartość zamówienia
);

-- Pozycje zamówienia (Co klient chce kupić - ilość z katalogu) [cite: 495]
CREATE TABLE OrderLines (
    order_line_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES CustomerOrders(order_id),
    product_id INT REFERENCES Products(product_id),
    quantity INT NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL -- Cena w momencie zakupu (ochrona przed zmianą cen)
);


-- 6. SPRZEDAŻ I TRANSAKCJE (Sklep stacjonarny + finalizacja online)

-- Transakcje sprzedaży (Paragon/Faktura) [cite: 72, 77]
CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES Employees(employee_id), -- Sprzedawca
    customer_id INT REFERENCES Customers(customer_id), -- Opcjonalne (klient z ulicy lub zarejestrowany)
    order_id INT REFERENCES CustomerOrders(order_id), -- Jeśli to odbiór zamówienia online
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    document_type VARCHAR(20) CHECK (document_type IN ('PARAGON', 'FAKTURA')),
    total_amount DECIMAL(10, 2) NOT NULL
);

-- Pozycje na paragonie (Konkretne sprzedane egzemplarze) [cite: 163, 565]
-- Tutaj wiążemy sprzedaż z konkretnym 'item_id', co automatycznie zmienia jego status na 'SPRZEDANY'.
CREATE TABLE TransactionItems (
    tx_item_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES Transactions(transaction_id),
    item_id INT REFERENCES ProductItems(item_id), -- Konkretny egzemplarz zdjęty ze stanu
    price_sold DECIMAL(10, 2) NOT NULL
);


-- 7. ZWROTY I REKLAMACJE

-- Zwroty [cite: 24, 167, 517]
CREATE TABLE Returns (
    return_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES Transactions(transaction_id), -- Dowód zakupu
    return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'ROZPATRYWANY' -- Przyjęty, Odrzucony
);

-- Szczegóły zwrotu (który przedmiot wraca)
CREATE TABLE ReturnItems (
    return_item_id SERIAL PRIMARY KEY,
    return_id INT REFERENCES Returns(return_id),
    item_id INT REFERENCES ProductItems(item_id),
    condition_check VARCHAR(50) -- np. "Nierozpakowany" lub "Usterka" [cite: 24]
    -- Po zwrocie trigger powinien zmienić status w ProductItems na 'NA_STANIE' lub 'USZKODZONY' [cite: 27, 28]
);
