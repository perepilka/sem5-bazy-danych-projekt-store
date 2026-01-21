# 🛒 System Zarządzania Sprzedażą w Sklepie Elektronicznym

**Projekt:** Bazy Danych - Etap 2  
**Grupa:** BD_CZ07_5  
**Autorzy:** KUNICKI Mateusz, PEREPILKA Yaroslav, PIETRZAK Maciej  
**Data:** Styczeń 2026

---

## 📋 Opis Projektu

Kompleksowy system zarządzania sprzedażą dla sklepu elektronicznego z obsługą:
- ✅ **Portal klienta** - przeglądanie produktów, składanie zamówień, historia zakupów
- ✅ **Panel pracownika** - zarządzanie magazynem, dostawami, zamówieniami, zwrotami
- ✅ **Kontrola dostępu** - 3 role pracowników (KIEROWNIK, SPRZEDAWCA, MAGAZYNIER)
- ✅ **System zamówień** - online i stacjonarny (POS)
- ✅ **Zarządzanie zwrotami** - pełen przepływ od zgłoszenia do realizacji

---

## 🚀 Szybki Start

### Wymagania
- Java 21 JDK
- Node.js 18+ & npm
- Docker & Docker Compose
- Git

### 1. Uruchomienie Backendu (2 minuty)

```bash
cd backend

# Start PostgreSQL
docker-compose up -d

# Sprawdź czy baza działa
docker ps

# Uruchom backend
./mvnw spring-boot:run
```

**Backend dostępny:** `http://localhost:8080`  
**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

### 2. Uruchomienie Frontendu (3 minuty)

```bash
cd frontend

# Zainstaluj zależności (pierwszy raz)
npm install

# Uruchom serwer deweloperski
npm run dev
```

**Frontend dostępny:** `http://localhost:5173`

### 3. Test Systemu

1. **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
2. **Testowe logowanie:**
   - Klient: użyj endpointu `/api/auth/customer/login`
   - Pracownik: użyj endpointu `/api/auth/employee/login`
3. **Frontend:** Otwórz `http://localhost:5173`

---

## 📁 Struktura Projektu

```
sem5-bazy-danych-projekt-store/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/          # Kod Java
│   │   └── org/pwr/store/
│   │       ├── config/         # Konfiguracja (Security, CORS)
│   │       ├── controller/     # REST API endpointy
│   │       ├── model/          # Encje JPA
│   │       ├── repository/     # Repozytoria danych
│   │       ├── service/        # Logika biznesowa
│   │       ├── dto/            # Data Transfer Objects
│   │       └── util/           # Narzędzia (JWT, etc.)
│   ├── database/               # Skrypty SQL
│   │   ├── schema.sql          # Schemat bazy danych
│   │   └── test-data.sql       # Dane testowe
│   ├── docker-compose.yml      # PostgreSQL container
│   └── pom.xml                 # Maven dependencies
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── api/                # Klient API (axios)
│   │   ├── components/         # Komponenty React
│   │   ├── pages/              # Strony aplikacji
│   │   │   ├── customer/       # Portal klienta (7 stron)
│   │   │   └── employee/       # Panel pracownika (7 stron)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zarządzanie stanem (Zustand)
│   │   └── App.tsx             # Główny komponent
│   ├── .env.development        # Zmienne środowiskowe
│   └── package.json            # npm dependencies
│
├── start-servers.sh            # Skrypt do uruchomienia obu serwerów
├── API_REFERENCE.md            # Dokumentacja API
└── README.md                   # Ten plik
```

---

## 🎯 Funkcjonalności

### Portal Klienta (7 stron)
1. **Products** - przeglądanie produktów, wyszukiwanie, filtrowanie
2. **Product Detail** - szczegóły produktu, dodawanie do koszyka
3. **Cart** - zarządzanie koszykiem zakupów
4. **Checkout** - wybór sklepu odbioru, metody płatności
5. **Orders** - historia zamówień, statusy
6. **Profile** - zarządzanie kontem
7. **Stores** - lokalizacje sklepów

### Panel Pracownika (7 stron)
1. **Dashboard** - statystyki, ostatnia aktywność
2. **Inventory** - stan magazynowy według sklepów
3. **Deliveries** - tworzenie i śledzenie dostaw
4. **Orders** - zarządzanie wszystkimi zamówieniami
5. **Transactions** - historia transakcji
6. **Returns** - obsługa zwrotów
7. **Stores** - informacje o sklepach

### System Uprawnień

| Funkcja | KLIENT | SPRZEDAWCA | MAGAZYNIER | KIEROWNIK |
|---------|--------|------------|------------|-----------|
| Przeglądanie produktów | ✅ | ✅ | ✅ | ✅ |
| Składanie zamówień | ✅ | ❌ | ❌ | ❌ |
| Aktualizacja statusu zamówień | ❌ | ✅ | ❌ | ✅ |
| Zarządzanie dostawami | ❌ | ❌ | ✅ | ✅ |
| Obsługa zwrotów | ❌ | ✅ | ❌ | ✅ |
| Zarządzanie pracownikami | ❌ | ❌ | ❌ | ✅ |

---

## 🔐 API Endpoints

### Podstawowy URL: `http://localhost:8080/api`

### Uwierzytelnianie
- `POST /api/auth/customer/register` - Rejestracja klienta
- `POST /api/auth/customer/login` - Logowanie klienta
- `POST /api/auth/employee/login` - Logowanie pracownika

### Produkty
- `GET /api/products` - Lista produktów (paginated)
- `GET /api/products/{id}` - Szczegóły produktu
- `GET /api/products/search?query=...` - Wyszukiwanie
- `GET /api/products/{id}/availability` - Dostępność w sklepach

### Zamówienia
- `POST /api/orders` - Złóż zamówienie (klient)
- `GET /api/orders/my` - Moje zamówienia (klient)
- `GET /api/orders` - Wszystkie zamówienia (pracownik)
- `PATCH /api/orders/{id}/status` - Zmiana statusu (SPRZEDAWCA/KIEROWNIK)

### Dostawy
- `GET /api/deliveries` - Lista dostaw
- `POST /api/deliveries` - Nowa dostawa (MAGAZYNIER/KIEROWNIK)
- `PATCH /api/deliveries/{id}/status` - Zmiana statusu

### Zwroty
- `GET /api/returns` - Lista zwrotów
- `PATCH /api/returns/{id}/status` - Zmiana statusu (SPRZEDAWCA/KIEROWNIK)

### Sklepy
- `GET /api/stores` - Lista sklepów
- `GET /api/stores/{id}/inventory` - Stan magazynowy

**Pełna dokumentacja:** [API_REFERENCE.md](./API_REFERENCE.md)  
**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

---

## 🗄️ Baza Danych

### PostgreSQL (Docker)

```bash
# Start
cd backend
docker-compose up -d

# Połącz się z bazą
docker exec -it store-postgres psql -U storeuser -d store

# W konsoli psql:
\dt                  # Lista tabel
\d "Stores"          # Struktura tabeli
SELECT * FROM "Stores";
\q                   # Wyjście
```

### Główne Tabele
- **Customers** - dane klientów
- **Employees** - dane pracowników
- **Stores** - sklepy
- **Products** - produkty
- **Categories** - kategorie produktów
- **ProductItems** - konkretne egzemplarze produktów
- **CustomerOrders** - zamówienia
- **OrderLines** - linie zamówień
- **Deliveries** - dostawy
- **DeliveryLines** - linie dostaw
- **Transactions** - transakcje sprzedaży
- **Returns** - zwroty

**Schemat:** `backend/database/schema.sql`  
**Dane testowe:** `backend/database/test-data.sql`

---

## 🛠️ Przydatne Komendy

### Backend

```bash
cd backend

# Uruchom backend
./mvnw spring-boot:run

# Build JAR
./mvnw clean package

# Testy
./mvnw test

# Baza danych
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose down -v      # Stop + usuń dane
docker-compose logs -f      # Logi
```

### Frontend

```bash
cd frontend

# Deweloperski serwer
npm run dev

# Build produkcyjny
npm run build

# Preview buildu
npm run preview

# Linting
npm run lint
npm run lint -- --fix

# Testy
npm test
npm test -- --coverage
```

### Oba Serwery

```bash
# Z głównego katalogu projektu
./start-servers.sh
```

---

## 🧪 Testowanie

### 1. Backend - Swagger UI

1. Otwórz: `http://localhost:8080/swagger-ui/index.html`
2. Przetestuj endpoint logowania:
   - Klient: `POST /api/auth/customer/login`
   - Pracownik: `POST /api/auth/employee/login`
3. Skopiuj token z odpowiedzi
4. Kliknij **Authorize** (🔒) na górze strony
5. Wklej token i kliknij "Authorize"
6. Teraz możesz testować wszystkie endpointy!

### 2. Frontend - Browser

1. Otwórz: `http://localhost:5173`
2. Przejdź do `/login` lub `/employee/login`
3. Użyj danych testowych z bazy
4. Przetestuj różne funkcjonalności

### 3. Baza Danych

```bash
# Sprawdź dane testowe
docker exec -it store-postgres psql -U storeuser -d store

# Przykłady zapytań
SELECT * FROM "Customers";
SELECT * FROM "Employees";
SELECT * FROM "Products" LIMIT 10;
SELECT * FROM "CustomerOrders" WHERE status = 'ZATWIERDZONY';
```

---

## 📊 Status Implementacji

### ✅ Zrobione (100%)

**Backend:**
- ✅ Schemat bazy danych (20+ tabel)
- ✅ Wszystkie encje JPA
- ✅ REST API (40+ endpointów)
- ✅ Uwierzytelnianie JWT
- ✅ Kontrola dostępu (role-based)
- ✅ Walidacja danych
- ✅ Obsługa błędów
- ✅ Swagger dokumentacja

**Frontend:**
- ✅ 14 kompletnych stron
- ✅ 20+ custom React hooks
- ✅ Integracja z API
- ✅ Routing
- ✅ Zarządzanie stanem
- ✅ Formularze z walidacją
- ✅ Responsywny layout

**Funkcjonalności:**
- ✅ Rejestracja i logowanie
- ✅ Przeglądanie produktów
- ✅ Koszyk zakupowy
- ✅ Składanie zamówień
- ✅ Historia zamówień
- ✅ Panel pracownika
- ✅ Zarządzanie magazynem
- ✅ Dostawy
- ✅ Zwroty
- ✅ Transakcje

### 🔧 Do Dopracowania

1. **Testy jednostkowe** - backend i frontend
2. **Testy E2E** - pełne przepływy użytkownika
3. **Optymalizacja wydajności** - caching, lazy loading
4. **Obsługa błędów** - bardziej szczegółowe komunikaty
5. **UI/UX** - drobne poprawki, ikony, animacje
6. **Deployment** - przygotowanie do produkcji

---

## 🐛 Rozwiązywanie Problemów

### Port 8080 zajęty

```bash
# Znajdź proces
lsof -ti:8080

# Zabij proces
lsof -ti:8080 | xargs kill -9
```

### Baza danych nie działa

```bash
cd backend

# Restart
docker-compose restart

# Sprawdź logi
docker-compose logs -f postgres

# Zresetuj bazę (UWAGA: usuwa dane!)
docker-compose down -v
docker-compose up -d
```

### Frontend nie łączy się z backendem

1. Sprawdź czy backend działa: `curl http://localhost:8080/api/categories`
2. Sprawdź `.env.development`: `VITE_API_BASE_URL=http://localhost:8080/api`
3. Sprawdź błędy CORS w konsoli przeglądarki
4. Restart frontendu: `npm run dev`

### Błędy przy `npm install`

```bash
# Wyczyść cache
npm cache clean --force

# Usuń i przeinstaluj
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Dokumentacja

- **[API_REFERENCE.md](./API_REFERENCE.md)** - Pełna dokumentacja API
- **Swagger UI:** `http://localhost:8080/swagger-ui/index.html` - Interaktywna dokumentacja
- **Schema:** `backend/database/schema.sql` - Schemat bazy danych
- **Etap 2 Docs:** `etap2.docx` - Wymagania projektowe

---

## 🔐 Bezpieczeństwo

### Zaimplementowane
- ✅ Hashowanie haseł (BCrypt)
- ✅ JWT tokeny (authentication)
- ✅ Kontrola dostępu oparta na rolach (authorization)
- ✅ Walidacja danych wejściowych
- ✅ Ochrona przed SQL Injection (JPA)
- ✅ CORS configuration
- ✅ HTTPS ready (produkcja)

### Uwagi Bezpieczeństwa
- ❗ Zmień JWT secret w produkcji
- ❗ Użyj silnych haseł w bazie danych
- ❗ Włącz HTTPS w produkcji
- ❗ Regularnie aktualizuj dependencies
- ❗ Dodaj rate limiting dla API

---

## 🚀 Deployment (Produkcja)

### Backend

```bash
cd backend

# Build
./mvnw clean package

# JAR znajduje się w:
# target/store-0.0.1-SNAPSHOT.jar

# Uruchom z parametrami produkcyjnymi
java -jar target/store-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:postgresql://prod-host:5432/store \
  --spring.datasource.username=prod_user \
  --spring.datasource.password=prod_password
```

### Frontend

```bash
cd frontend

# Build
npm run build

# Pliki znajdują się w: dist/
# Deploy na serwer statyczny (nginx, Apache, Vercel, etc.)
```

### Docker (Opcjonalnie)

```bash
# TODO: Dodać Dockerfile dla backendu
# TODO: Dodać Dockerfile dla frontendu
# TODO: Dodać docker-compose.prod.yml
```

---

## 👥 Autorzy

- **KUNICKI Mateusz** - Backend, Database
- **PEREPILKA Yaroslav** - Full Stack, Integration
- **PIETRZAK Maciej** - Frontend, UI/UX

**Politechnika Wrocławska**  
**Wydział Informatyki i Telekomunikacji**  
**Bazy Danych - Etap 2**  
**Grupa:** BD_CZ07_5  
**Rok akademicki:** 2025/2026

---

## 📝 Licencja

Projekt edukacyjny - Politechnika Wrocławska © 2026

---

## 🆘 Potrzebujesz Pomocy?

1. **Swagger UI** - najszybszy sposób na przetestowanie API
2. **API_REFERENCE.md** - szczegółowa dokumentacja endpointów
3. **Backend Logs** - sprawdź konsole gdzie uruchomiłeś `./mvnw spring-boot:run`
4. **Frontend Console** - otwórz Developer Tools w przeglądarce (F12)
5. **Database** - sprawdź dane bezpośrednio w PostgreSQL

---

**Happy Coding! 🚀**

**Ostatnia aktualizacja:** Styczeń 2026
