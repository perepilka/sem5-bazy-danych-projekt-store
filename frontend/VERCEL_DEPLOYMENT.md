# Vercel Deployment Guide - Frontend

## Крок 1: Підготовка проєкту

Переконайтеся, що ваш frontend готовий:

```bash
cd frontend
npm install
npm run build  # Перевірте, що build працює
```

## Крок 2: Деплой на Vercel

### Варіант A: Через Vercel Dashboard (рекомендовано)

1. Зайдіть на [vercel.com](https://vercel.com)
2. Натисніть "Add New" → "Project"
3. Import ваш GitHub репозиторій
4. Налаштування:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Варіант B: Через Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel
```

## Крок 3: Environment Variables на Vercel

У Vercel Dashboard → Settings → Environment Variables додайте:

### Production
```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_APP_NAME=Store Management System
```

### Preview (для PR)
```bash
VITE_API_BASE_URL=https://your-backend-preview.railway.app/api
VITE_APP_NAME=Store Management System (Preview)
```

### Development
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Store Management System (Dev)
```

## Крок 4: Оновіть CORS на Backend (Railway)

Після деплою на Vercel, додайте Vercel URLs до Railway змінних:

```bash
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app,http://localhost:5173
```

**Важливо**: Vercel створює preview URLs для кожного PR у форматі:
- `your-app-git-branch-name-username.vercel.app`

Можете використовувати wildcard pattern або додавати конкретні URLs.

## Перемикання між Local та Production

### Локальна розробка

1. Використовуйте `.env.development`:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

2. Запустіть локальний backend:
```bash
cd backend
docker-compose up -d
./mvnw spring-boot:run
```

3. Запустіть frontend:
```bash
cd frontend
npm run dev
```

### Production (Vercel + Railway)

- **Автоматично**: Push до GitHub → Vercel автоматично деплоїть
- Frontend підключається до Railway backend через `VITE_API_BASE_URL`

## Vercel Domains

Vercel надає:
- **Production**: `your-app.vercel.app` (або custom domain)
- **Preview**: `your-app-git-branch.vercel.app` (для кожного PR)

Додайте ці домени до CORS на Railway!

## Troubleshooting

### CORS Error
- Перевірте `CORS_ALLOWED_ORIGINS` на Railway
- Додайте як production так і preview URLs

### API не доступний
- Перевірте `VITE_API_BASE_URL` на Vercel
- Переконайтеся, що Railway backend працює

### Build Failed
- Перевірте, що `Root Directory` встановлено на `frontend`
- Перевірте, що всі залежності в `package.json`

## Monitoring

### Vercel Dashboard
- Логи deployment
- Analytics
- Performance metrics

### Railway Dashboard
- Backend логи
- Database metrics
- Resource usage

## Custom Domain (опціонально)

1. **Vercel**: Settings → Domains → Add custom domain
2. **Railway**: Settings → Domains → Generate domain or add custom
3. Оновіть CORS з новими доменами
