-- Insert test stores
INSERT INTO stores (address, city, phone_number) VALUES
('ul. Główna 1', 'Wrocław', '+48123456789'),
('ul. Rynek 10', 'Kraków', '+48987654321'),
('ul. Marszałkowska 5', 'Warszawa', '+48555666777');

-- Insert test employees (password is 'password123' hashed with BCrypt)
-- Note: You'll need to use the actual BCrypt hash from your application
INSERT INTO employees (store_id, first_name, last_name, position, login, password_hash, is_active) VALUES
(1, 'Jan', 'Kowalski', 'KIEROWNIK', 'jan.kowalski', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true),
(1, 'Anna', 'Nowak', 'SPRZEDAWCA', 'anna.nowak', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true),
(2, 'Piotr', 'Wiśniewski', 'MAGAZYNIER', 'piotr.wisniewski', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);

-- Insert test customer (password is 'password123' hashed with BCrypt)
INSERT INTO customers (first_name, last_name, email, phone_number, password_hash) VALUES
('Tomasz', 'Lewandowski', 'tomasz.lewandowski@example.com', '+48111222333', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Insert test categories
INSERT INTO categories (name) VALUES
('Elektronika'),
('AGD'),
('Komputery');

-- Insert test products
INSERT INTO products (category_id, name, description, base_price) VALUES
(1, 'Smartphone XYZ', 'Nowoczesny smartphone z dużym ekranem', 1999.99),
(1, 'Telewizor 55"', 'Smart TV 4K', 2499.99),
(2, 'Lodówka', 'Energooszczędna lodówka dwudrzwiowa', 1899.99),
(3, 'Laptop ABC', 'Laptop do pracy i rozrywki', 3499.99);
