# Railway Deployment Guide

## Підготовка до деплою

### 1. Створення проєкту на Railway

1. Зайдіть на [railway.app](https://railway.app)
2. Створіть новий проєкт
3. Додайте PostgreSQL database з marketplace
4. Додайте ваш GitHub репозиторій

### 2. Налаштування змінних середовища на Railway

У розділі Variables вашого сервісу додайте:

```bash
# JWT Configuration (ОБОВ'ЯЗКОВО змініть!)
JWT_SECRET=your-super-secure-secret-key-at-least-256-bits
JWT_EXPIRATION=86400000

# Frontend URL (замініть на ваш Vercel URL)
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app

# Domain Configuration (опціонально)
EMPLOYEE_DOMAIN=employee.your-domain.com
CUSTOMER_DOMAIN=your-domain.com

# Logging
LOGGING_LEVEL=INFO
```

**ВАЖЛИВО:** Railway автоматично надає змінні для PostgreSQL:
- `DATABASE_URL` (повний connection string)
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

Якщо використовуєте окрему БД, додайте:
```bash
DB_HOST=<your-db-host>
DB_PORT=5432
DB_NAME=<your-db-name>
DB_USERNAME=<your-db-user>
DB_PASSWORD=<your-db-password>
```

### 3. Налаштування Root Directory

У Settings → Deploy:
- **Root Directory**: `backend`

### 4. Деплой

Railway автоматично задеплоїть після push до GitHub.

## Перемикання між локальною розробкою та деплоєм

### Локальна розробка

1. **Використовуйте локальну базу даних:**
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Використовуйте `.env` файл:**
   ```bash
   cp .env.example .env
   # Редагуйте .env для локальних налаштувань
   ```

3. **Запустіть backend:**
   ```bash
   ./mvnw spring-boot:run
   ```
   або через IntelliJ IDEA

4. **Frontend буде підключатися до `http://localhost:8080`**

### Production (Railway + Vercel)

1. **Backend автоматично використовує production змінні з Railway**

2. **Frontend на Vercel:**
   - У Vercel встановіть змінну середовища:
   ```bash
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

3. **CORS автоматично дозволить запити з Vercel**

## Структура конфігурації

```
backend/
├── .env                    # Локальна розробка (не комітити!)
├── .env.example            # Приклад для локальної розробки
├── .env.production         # Документація production змінних
├── railway.json            # Railway конфігурація
├── nixpacks.toml          # Nixpacks build конфігурація
└── src/main/resources/
    └── application.properties  # Spring конфігурація з fallback значеннями
```

## Перевірка деплою

1. **Перевірте логи на Railway** для помилок
2. **Тестуйте API endpoints:**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```
3. **Перевірте Swagger UI:**
   ```
   https://your-backend.railway.app/swagger-ui.html
   ```

## Troubleshooting

### База даних не підключається
- Перевірте, що Railway PostgreSQL підключений до вашого сервісу
- Перевірте `DATABASE_URL` у змінних середовища

### CORS помилки
- Додайте ваш Vercel URL до `CORS_ALLOWED_ORIGINS`
- Включіть як production так і preview URLs

### Build fails
- Перевірте, що `Root Directory` встановлено на `backend`
- Перевірте Java version (21) у логах build

## Міграція бази даних

Railway PostgreSQL порожня після створення. Виконайте міграції:

```bash
# Підключіться до Railway PostgreSQL через Railway CLI або psql
# Виконайте SQL скрипти з backend/database/
```

Або використовуйте Flyway/Liquibase для автоматичних міграцій.
