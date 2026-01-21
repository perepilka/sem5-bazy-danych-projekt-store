-- Insert test stores
INSERT INTO stores (address, city, phone_number)
VALUES ('ul. Główna 1', 'Wrocław', '+48123456789'),
       ('ul. Rynek 10', 'Kraków', '+48987654321'),
       ('ul. Marszałkowska 5', 'Warszawa', '+48555666777'),
       ('ul. Piłsudskiego 15', 'Poznań', '+48444555666'),
       ('ul. Długa 8', 'Gdańsk', '+48333444555');

-- Insert test employees (password is 'password123' hashed with BCrypt)
-- Hash generated: $2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK
INSERT INTO employees (store_id, first_name, last_name, position, login, password_hash, is_active)
VALUES (1, 'Jan', 'Kowalski', 'KIEROWNIK', '    ',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (1, 'Anna', 'Nowak', 'SPRZEDAWCA', 'anna.nowak',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (1, 'Marek', 'Zieliński', 'MAGAZYNIER', 'marek.zielinski',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (2, 'Piotr', 'Wiśniewski', 'KIEROWNIK', 'piotr.wisniewski',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (2, 'Katarzyna', 'Kamińska', 'SPRZEDAWCA', 'katarzyna.kaminska',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (3, 'Michał', 'Lewandowski', 'KIEROWNIK', 'michal.lewandowski',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (3, 'Agnieszka', 'Szymańska', 'SPRZEDAWCA', 'agnieszka.szymanska',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (3, 'Paweł', 'Dąbrowski', 'MAGAZYNIER', 'pawel.dabrowski',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (4, 'Ewa', 'Grabowska', 'KIEROWNIK', 'ewa.grabowska',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (4, 'Tomasz', 'Pawlak', 'MAGAZYNIER', 'tomasz.pawlak',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true),
       (5, 'Magdalena', 'Król', 'SPRZEDAWCA', 'magdalena.krol',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK', true);

-- Insert test customers (password is 'password123' hashed with BCrypt)
-- Hash generated: $2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK
INSERT INTO customers (first_name, last_name, email, phone_number, password_hash)
VALUES ('Tomasz', 'Lewandowski', 'tomasz.lewandowski@example.com', '+48111222333',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK'),
       ('Maria', 'Kowalska', 'maria.kowalska@example.com', '+48222333444',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK'),
       ('Adam', 'Nowak', 'adam.nowak@example.com', '+48333444555',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK'),
       ('Joanna', 'Wiśniewska', 'joanna.wisniewska@example.com', '+48444555666',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK'),
       ('Krzysztof', 'Wójcik', 'krzysztof.wojcik@example.com', '+48555666777',
        '$2a$10$NkmJSheq.3H6XB7D0hv0XO0G2XG/LweBFR.kDbGV7wxkc94DxgtlK');

-- Insert test categories
INSERT INTO categories (name)
VALUES ('Elektronika'),
       ('AGD'),
       ('Komputery'),
       ('Smartfony'),
       ('Telewizory'),
       ('Audio'),
       ('Gaming'),
       ('Akcesoria');

-- Insert test products
INSERT INTO products (category_id, name, description, base_price, low_stock_threshold, minimum_stock)
VALUES
-- Smartfony
(4, 'iPhone 15 Pro', 'Najnowszy model iPhone z układem A17 Pro', 5499.99, 5, 15),
(4, 'Samsung Galaxy S24', 'Flagowy smartfon Samsung z ekranem AMOLED', 4299.99, 8, 20),
(4, 'Xiaomi 13', 'Smartfon z doskonałym aparatem', 2799.99, 10, 25),
(4, 'Google Pixel 8', 'Czysty Android z najlepszym aparatem', 3499.99, 7, 18),

-- Telewizory
(5, 'Samsung QLED 65"', 'Telewizor QLED 4K z HDR', 4999.99, 3, 10),
(5, 'LG OLED 55"', 'Telewizor OLED z idealną czernią', 5999.99, 3, 8),
(5, 'Sony Bravia 50"', 'Smart TV 4K z Android TV', 3299.99, 5, 12),
(5, 'TCL 43" Smart TV', 'Budżetowy Smart TV z 4K', 1599.99, 10, 20),

-- Komputery
(3, 'MacBook Pro 14"', 'Laptop profesjonalny z M3 Pro', 9999.99, 4, 10),
(3, 'Dell XPS 15', 'Laptop z procesorem Intel i7', 7499.99, 6, 15),
(3, 'Lenovo ThinkPad', 'Laptop biznesowy z matową matrycą', 5999.99, 8, 20),
(3, 'ASUS ROG Strix', 'Laptop gamingowy z RTX 4070', 8999.99, 5, 12),

-- AGD
(2, 'Lodówka Samsung', 'Lodówka side-by-side No Frost', 3499.99, 3, 8),
(2, 'Pralka Bosch', 'Pralka automatyczna 8kg A+++', 2299.99, 5, 12),
(2, 'Zmywarka Siemens', 'Zmywarka 60cm z funkcją Auto Open', 2799.99, 4, 10),
(2, 'Ekspres DeLonghi', 'Ekspres ciśnieniowy do kawy', 1899.99, 6, 15),

-- Audio
(6, 'Sony WH-1000XM5', 'Słuchawki z ANC najwyższej klasy', 1499.99, 10, 25),
(6, 'Bose QuietComfort', 'Komfortowe słuchawki z redukcją szumów', 1299.99, 12, 30),
(6, 'JBL Flip 6', 'Przenośny głośnik Bluetooth', 499.99, 15, 35),
(6, 'Soundbar Samsung', 'Soundbar 3.1 z subwooferem', 1999.99, 6, 15),

-- Gaming
(7, 'PlayStation 5', 'Konsola nowej generacji', 2499.99, 8, 20),
(7, 'Xbox Series X', 'Konsola Xbox z 4K', 2299.99, 8, 20),
(7, 'Nintendo Switch OLED', 'Przenośna konsola z ekranem OLED', 1499.99, 10, 25),
(7, 'Steam Deck', 'Handheld PC do gier', 1999.99, 7, 18),

-- Akcesoria
(8, 'Magic Keyboard', 'Klawiatura bezprzewodowa Apple', 599.99, 12, 30),
(8, 'Logitech MX Master', 'Mysz ergonomiczna dla profesjonalistów', 399.99, 10, 25),
(8, 'USB-C Hub', 'Rozszerzenie portów 7w1', 199.99, 20, 40),
(8, 'Etui iPhone 15', 'Silikonowe etui z MagSafe', 199.99, 15, 35);

-- Insert sample deliveries with store assignments
INSERT INTO deliveries (supplier_name, delivery_date, status, store_id)
VALUES 
    ('Tech Wholesale Poland', '2026-01-15', 'ZREALIZOWANA', 1),
    ('Electronics Distribution', '2026-01-16', 'ZREALIZOWANA', 2),
    ('Smart Devices Sp. z o.o.', '2026-01-17', 'W_TRAKCIE', 3),
    ('Home Appliances Inc', '2026-01-18', 'PRZYJETA', 4),
    ('Media Market Supplier', '2026-01-19', 'PRZYJETA', 5);

-- Insert delivery lines for the sample deliveries
INSERT INTO deliverylines (delivery_id, product_id, quantity, purchase_price)
VALUES
    -- Delivery 1 to Store 1 (Wrocław)
    (1, 1, 10, 4500.00),  -- iPhone 15 Pro
    (1, 9, 5, 8500.00),   -- MacBook Pro 14"
    (1, 17, 15, 1200.00), -- Sony WH-1000XM5
    
    -- Delivery 2 to Store 2 (Kraków)
    (2, 2, 12, 3500.00),  -- Samsung Galaxy S24
    (2, 5, 8, 4200.00),   -- Samsung QLED 65"
    (2, 21, 20, 2000.00), -- PlayStation 5
    
    -- Delivery 3 to Store 3 (Warszawa) - in progress
    (3, 3, 15, 2300.00),  -- Xiaomi 13
    (3, 10, 10, 6200.00), -- Dell XPS 15
    (3, 19, 25, 400.00),  -- JBL Flip 6
    
    -- Delivery 4 to Store 4 (Poznań) - accepted
    (4, 13, 6, 2900.00),  -- Lodówka Samsung
    (4, 14, 8, 1900.00),  -- Pralka Bosch
    
    -- Delivery 5 to Store 5 (Gdańsk) - accepted
    (5, 22, 15, 1900.00), -- Xbox Series X
    (5, 26, 20, 320.00);  -- Logitech MX Master

-- Insert product items (individual items for tracking)
-- Store 1 (Wrocław) - Create multiple items for each product
DO
$$
    DECLARE
store_num INT;
        prod_id
INT;
        item_count
INT;
        i
INT;
BEGIN
        -- For store 1, add items for all products
FOR prod_id IN 1..28 LOOP
            item_count := 3 + (prod_id % 5);  -- Between 3-7 items per product
FOR i IN 1..item_count LOOP
                INSERT INTO productitems (product_id, store_id, current_status)
                VALUES (prod_id, 1, 'NA_STANIE');
END LOOP;
END LOOP;

        -- For store 2, add items for products 1-20
FOR prod_id IN 1..20 LOOP
            item_count := 2 + (prod_id % 4);  -- Between 2-5 items
FOR i IN 1..item_count LOOP
                INSERT INTO productitems (product_id, store_id, current_status)
                VALUES (prod_id, 2, 'NA_STANIE');
END LOOP;
END LOOP;

        -- For store 3, add items for products 1-25
FOR prod_id IN 1..25 LOOP
            item_count := 4 + (prod_id % 6);  -- Between 4-9 items
FOR i IN 1..item_count LOOP
                INSERT INTO productitems (product_id, store_id, current_status)
                VALUES (prod_id, 3, 'NA_STANIE');
END LOOP;
END LOOP;

        -- For store 4, add items for selected products
        FOREACH
prod_id IN ARRAY ARRAY[1,2,3,5,7,9,11,13,15,17,19,21,23,25,27] LOOP
            item_count := 2 + ((prod_id * 7) % 5);  -- Between 2-6 items
FOR i IN 1..item_count LOOP
                INSERT INTO productitems (product_id, store_id, current_status)
                VALUES (prod_id, 4, 'NA_STANIE');
END LOOP;
END LOOP;

        -- For store 5, add items for selected products
        FOREACH
prod_id IN ARRAY ARRAY[2,4,6,8,10,12,14,16,18,20,22,24,26,28] LOOP
            item_count := 2 + ((prod_id * 3) % 4);  -- Between 2-5 items
FOR i IN 1..item_count LOOP
                INSERT INTO productitems (product_id, store_id, current_status)
                VALUES (prod_id, 5, 'NA_STANIE');
END LOOP;
END LOOP;
END $$;
