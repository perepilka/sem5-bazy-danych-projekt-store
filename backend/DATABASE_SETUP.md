# Database Setup Instructions

## Quick Setup

### 1. Start PostgreSQL Container
```bash
docker-compose up -d
```

Wait about 10 seconds for the container to fully start.

### 2. Verify Container is Running
```bash
docker ps | grep store-postgres
```

You should see the container running on port 5432.

### 3. Apply Database Schema
```bash
cat database/schema.sql | docker exec -i store-postgres psql -U storeuser -d store
```

Expected output:
```
CREATE TYPE
CREATE TYPE
CREATE TYPE
CREATE TABLE
CREATE TABLE
... (14 tables total)
```

### 4. Load Test Data (Optional)
```bash
cat database/test-data.sql | docker exec -i store-postgres psql -U storeuser -d store
```

Expected output:
```
INSERT 0 3
INSERT 0 3
INSERT 0 1
INSERT 0 3
INSERT 0 4
```

### 5. Verify Tables Created
```bash
docker exec -it store-postgres psql -U storeuser -d store -c "\dt"
```

You should see 14 tables listed.

---

## Manual Database Access

### Connect to PostgreSQL Shell
```bash
docker exec -it store-postgres psql -U storeuser -d store
```

### Useful Commands Inside psql

**List all tables:**
```sql
\dt
```

**View table structure:**
```sql
\d employees
```

**Check ENUMs:**
```sql
\dT
```

**View data:**
```sql
SELECT * FROM stores;
SELECT * FROM employees;
SELECT * FROM customers;
```

**Count records:**
```sql
SELECT COUNT(*) FROM customers;
```

**Exit psql:**
```
\q
```

---

## Database Management

### Stop Database
```bash
docker-compose down
```

### Restart Database (keeps data)
```bash
docker-compose restart
```

### Reset Database (deletes all data)
```bash
docker-compose down -v
docker-compose up -d
# Then reapply schema and test data
```

### Backup Database
```bash
docker exec store-postgres pg_dump -U storeuser store > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
cat backup_file.sql | docker exec -i store-postgres psql -U storeuser -d store
```

### View Database Logs
```bash
docker-compose logs -f postgres
```

---

## Troubleshooting

### Container Won't Start
Check logs:
```bash
docker logs store-postgres
```

Remove and recreate:
```bash
docker-compose down -v
docker-compose up -d
```

### Connection Refused
Make sure container is running:
```bash
docker ps
```

Check port 5432 is not used by another PostgreSQL:
```bash
sudo lsof -i :5432
```

### Schema Application Fails
Make sure you're in the project root directory:
```bash
pwd
# Should show: .../sem5-bazy-danych-projekt-store
```

Check schema file exists:
```bash
ls -l database/schema.sql
```

### Can't Connect from Application
Verify `.env` file settings:
```bash
cat .env | grep DB_
```

Should show:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store
DB_USERNAME=storeuser
DB_PASSWORD=changeme
```

---

## Database Schema Overview

### Core Tables

**stores** - Physical store locations
- store_id (PK)
- address, city, phone_number

**employees** - Staff members
- employee_id (PK)
- store_id (FK → stores)
- first_name, last_name
- position (ENUM: KIEROWNIK, SPRZEDAWCA, MAGAZYNIER)
- login (unique), password_hash
- is_active

**customers** - Registered customers
- customer_id (PK)
- first_name, last_name
- email (unique), phone_number
- password_hash
- registration_date

### Product Management

**categories** - Product categories
- category_id (PK)
- name (unique)

**products** - Product catalog
- product_id (PK)
- category_id (FK → categories)
- name, description, base_price

**productitems** - Individual product instances
- item_id (PK)
- product_id (FK → products)
- delivery_id (FK → deliveries)
- store_id (FK → stores)
- current_status (ENUM: NA_STANIE, NA_EKSPOZYCJI, ZAREZERWOWANY, OCZEKUJE_NA_ODBIOR, SPRZEDANY, USZKODZONY, ZLIKWIDOWANY)

### Inventory

**deliveries** - Delivery records
- delivery_id (PK)
- supplier_name, delivery_date, status

**deliverylines** - Delivery contents
- delivery_line_id (PK)
- delivery_id (FK → deliveries)
- product_id (FK → products)
- quantity, purchase_price

### Sales

**customerorders** - Customer orders
- order_id (PK)
- customer_id (FK → customers)
- pickup_store_id (FK → stores)
- order_date, status (ENUM: NOWE, W_REALIZACJI, GOTOWE_DO_ODBIORU, ZAKONCZONE, ANULOWANE)
- total_amount

**orderlines** - Order items
- order_line_id (PK)
- order_id (FK → customerorders)
- product_id (FK → products)
- quantity, price_at_order

**transactions** - Sales transactions (receipts/invoices)
- transaction_id (PK)
- employee_id (FK → employees)
- customer_id (FK → customers)
- order_id (FK → customerorders)
- transaction_date, document_type, total_amount

**transactionitems** - Sold items
- tx_item_id (PK)
- transaction_id (FK → transactions)
- item_id (FK → productitems)
- price_sold

### Returns

**returns** - Return requests
- return_id (PK)
- transaction_id (FK → transactions)
- return_date, reason, status

**returnitems** - Returned items
- return_item_id (PK)
- return_id (FK → returns)
- item_id (FK → productitems)
- condition_check

---

## Environment Variables

Database connection is configured in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store
DB_USERNAME=storeuser
DB_PASSWORD=changeme
```

⚠️ **For production:** Change `DB_PASSWORD` to a strong password!

---

## Tips

1. **Always backup before major changes:**
   ```bash
   docker exec store-postgres pg_dump -U storeuser store > backup.sql
   ```

2. **Use transactions when testing SQL:**
   ```sql
   BEGIN;
   -- Your SQL commands here
   ROLLBACK; -- or COMMIT;
   ```

3. **Monitor active connections:**
   ```sql
   SELECT * FROM pg_stat_activity WHERE datname = 'store';
   ```

4. **Check table sizes:**
   ```sql
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```
