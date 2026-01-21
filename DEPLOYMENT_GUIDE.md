# Full Stack Deployment Guide

## Огляд архітектури

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Vercel    │   -->   │   Railway    │   -->   │  PostgreSQL  │
│  (Frontend) │         │   (Backend)  │         │  (Railway)   │
└─────────────┘         └──────────────┘         └──────────────┘
```

## Швидкий старт - Production Deploy

### 1. Backend (Railway)

```bash
# 1. Push код на GitHub
git add .
git commit -m "Prepare for Railway deployment"
git push

# 2. На Railway:
#    - New Project → Deploy from GitHub
#    - Select repository
#    - Add PostgreSQL from Marketplace
#    - Set Root Directory: backend
#    - Add environment variables (див. backend/.env.production)

# 3. Отримайте Railway URL: https://your-app.railway.app
```

### 2. Frontend (Vercel)

```bash
# 1. На Vercel:
#    - New Project → Import from GitHub
#    - Select repository
#    - Set Root Directory: frontend
#    - Framework: Vite
#    - Add environment variable:
#      VITE_API_BASE_URL=https://your-app.railway.app/api

# 2. Deploy

# 3. Отримайте Vercel URL: https://your-app.vercel.app
```

### 3. Оновіть CORS

На Railway додайте змінну:
```bash
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app
```

Redeploy backend на Railway.

## Локальна розробка

### Setup (одноразово)

```bash
# Backend
cd backend
cp .env.example .env  # або використовуйте .env.local
docker-compose up -d  # Запустіть PostgreSQL

# Frontend
cd frontend
cp .env.example .env.development  # якщо потрібно
npm install
```

### Щоденна розробка

```bash
# Terminal 1 - База даних
cd backend
docker-compose up -d

# Terminal 2 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 3 - Frontend
cd frontend
npm run dev
```

Відкрийте: http://localhost:5173

## Перемикання між середовищами

### Файли конфігурації

```
backend/
├── .env                 # Git ignored - ваша локальна конфігурація
├── .env.local           # Шаблон для локальної розробки
├── .env.example         # Шаблон для нових розробників
└── .env.production      # Документація для Railway змінних

frontend/
├── .env.development     # Локальна розробка (автоматично)
└── .env.production      # Vercel змінні (встановлюються в UI)
```

### Локальна розробка

**Backend**: Використовує `.env` файл
```bash
DB_HOST=localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
LOGGING_LEVEL=DEBUG
```

**Frontend**: Використовує `.env.development`
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

### Production

**Backend** (Railway Variables):
```bash
# Database - автоматично від Railway PostgreSQL
DATABASE_URL=postgresql://...
# або
DB_HOST=...
DB_PORT=5432

# Ваші змінні
JWT_SECRET=secure-production-key
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
LOGGING_LEVEL=INFO
```

**Frontend** (Vercel Environment Variables):
```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | Railway provides automatically |
| `JWT_SECRET` | ✅ | - | Min 256 bits secure random string |
| `JWT_EXPIRATION` | ❌ | 86400000 | JWT token expiration (ms) |
| `CORS_ALLOWED_ORIGINS` | ✅ | localhost | Comma-separated Vercel URLs |
| `LOGGING_LEVEL` | ❌ | DEBUG | INFO for production |
| `EMPLOYEE_DOMAIN` | ❌ | - | Optional subdomain routing |
| `CUSTOMER_DOMAIN` | ❌ | - | Optional subdomain routing |

### Frontend (Vercel)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | ✅ | - | Railway backend URL + /api |
| `VITE_APP_NAME` | ❌ | Store Management System | App display name |

## Команди для швидкого переключення

### Локальна розробка → Production testing

```bash
# Frontend - тестуйте з production backend
cd frontend
VITE_API_BASE_URL=https://your-backend.railway.app/api npm run dev
```

### Production testing → Локальна розробка

```bash
# Просто перезапустіть без env variable
npm run dev
```

## Database Migrations

### Локально
```bash
cd backend
docker-compose up -d
# Виконайте SQL скрипти з backend/database/
psql -h localhost -U storeuser -d store -f database/schema.sql
```

### Production (Railway)
```bash
# Варіант 1: Railway Dashboard → PostgreSQL → Connect → psql
# Варіант 2: Railway CLI
railway connect postgres
# Виконайте міграції
```

## Корисні посилання

- **Backend Deployment**: `backend/RAILWAY_DEPLOYMENT.md`
- **Frontend Deployment**: `frontend/VERCEL_DEPLOYMENT.md`
- **API Documentation**: Backend Swagger UI
  - Local: http://localhost:8080/swagger-ui.html
  - Production: https://your-backend.railway.app/swagger-ui.html

## Troubleshooting

### "CORS policy" error
✅ Додайте Vercel URL до `CORS_ALLOWED_ORIGINS` на Railway

### Backend не підключається до БД
✅ Перевірте `DATABASE_URL` або окремі DB змінні на Railway

### Build fails на Railway
✅ Перевірте Root Directory: `backend`
✅ Перевірте Java 21 в логах

### Build fails на Vercel
✅ Перевірте Root Directory: `frontend`
✅ Перевірте Framework Preset: Vite

### Frontend білий екран
✅ Перевірте `VITE_API_BASE_URL` на Vercel
✅ Перевірте browser console для помилок

## Моніторинг

### Railway
- Логи: Dashboard → Your Service → Logs
- Metrics: Dashboard → Your Service → Metrics
- Database: Dashboard → PostgreSQL → Metrics

### Vercel
- Логи: Dashboard → Your Project → Deployments → View Logs
- Analytics: Dashboard → Your Project → Analytics
- Performance: Dashboard → Your Project → Speed Insights
