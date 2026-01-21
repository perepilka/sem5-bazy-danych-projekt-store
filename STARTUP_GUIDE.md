# Посібник з запуску проєкту

## Проблема і рішення

Якщо при запуску бекенду ви отримували помилку `ERROR: relation "deliveries" does not exist`, це означає, що база даних не була ініціалізована.

## Повне вирішення проблеми

Була виконана наступна робота:

1. ✅ **Виправлено схему БД** - додано відсутню колонку `created_at` до таблиці `deliveries`
2. ✅ **Ініціалізована база даних** - виконано `schema.sql` та `test-data.sql`
3. ✅ **Оновлено скрипт запуску** - тепер `start-servers.sh` автоматично перевіряє та ініціалізує БД

## Як запустити проєкт

### 1. Запустіть Docker контейнер з PostgreSQL

```bash
cd backend
docker-compose up -d
```

### 2. Запустіть сервери

```bash
./start-servers.sh
```

Скрипт автоматично:
- Перевірить, чи база даних ініціалізована
- Якщо ні - створить таблиці та завантажить тестові дані
- Запустить бекенд на порту 8080
- Запустить фронтенд на порту 5173

### 3. Перевірте роботу

- **Backend API**: http://localhost:8080/api/products
- **Frontend**: http://localhost:5173
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## Ручна ініціалізація БД (якщо потрібно)

Якщо потрібно перестворити базу даних:

```bash
cd backend

# Видалити всі дані
docker exec -i store-postgres psql -U storeuser -d store -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Створити схему
docker exec -i store-postgres psql -U storeuser -d store < database/schema.sql

# Завантажити тестові дані
docker exec -i store-postgres psql -U storeuser -d store < database/test-data.sql
```

## Зупинка серверів

```bash
# Зупинити бекенд
pkill -f "spring-boot:run"

# Зупинити фронтенд
pkill -f "npm run dev"

# Зупинити PostgreSQL
cd backend
docker-compose down
```

## Статус серверів

- ✅ **База даних**: PostgreSQL запущена в Docker (port 5432)
- ✅ **Backend**: Spring Boot працює на порту 8080
- ✅ **Frontend**: Vite dev server працює на порту 5173

## Виправлені проблеми

1. **Відсутня колонка `created_at`** - додано до `schema.sql` та до БД
2. **Порт 8080 зайнятий** - додано перевірку та зупинку старого процесу
3. **Неініціалізована БД** - скрипт тепер автоматично ініціалізує БД при першому запуску
