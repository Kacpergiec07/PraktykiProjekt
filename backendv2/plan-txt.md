# Plan implementacji nowego backendu dla aplikacji apteki

## Analiza obecnego systemu

Z analizy istniejącego backendu zauważam następujące problemy:

- Brak odpowiedniej struktury katalogów i organizacji kodu
- Brak walidacji i obsługi błędów
- Podatność na ataki SQL Injection w zapytaniach
- Słaby system uwierzytelniania i autoryzacji
- Brak middleware'ów do obsługi wspólnych zadań
- Niewystarczająca dokumentacja
- Brak testów
- Brak zarządzania konfiguracją (env)

## Cele nowego backendu

1. **Bezpieczeństwo** - zabezpieczenie przed najpopularniejszymi atakami
2. **Skalowalność** - możliwość rozbudowy systemu
3. **Utrzymywalność** - czytelny kod, łatwy w utrzymaniu
4. **Dokumentacja** - pełna dokumentacja API
5. **Zgodność z REST** - prawidłowa implementacja REST API
6. **Wydajność** - optymalizacja zapytań i operacji

## Technologie

- **Node.js** (Express.js) - jako główny framework
- **TypeScript** - dla typowania i lepszej organizacji kodu
- **PostgreSQL** - jako baza danych (zamiast SQLite)
- **Prisma** - jako ORM do komunikacji z bazą danych
- **JWT** - do uwierzytelniania i autoryzacji
- **Jest** - do testów
- **Swagger/OpenAPI** - do dokumentacji API
- **Docker** - do konteneryzacji
- **Winston** - do logowania

## Struktura katalogów

```
/
├── src/
│   ├── config/           # Konfiguracja aplikacji
│   ├── controllers/      # Kontrolery obsługujące żądania
│   ├── middlewares/      # Middleware'y
│   ├── models/           # Modele Prisma
│   ├── routes/           # Definicje tras API
│   ├── services/         # Logika biznesowa
│   ├── utils/            # Narzędzia pomocnicze
│   ├── validations/      # Schematy walidacji
│   └── app.ts            # Główny plik aplikacji
├── prisma/
│   └── schema.prisma     # Schema bazy danych
├── tests/                # Testy
├── docs/                 # Dokumentacja
├── docker/               # Pliki Docker
├── .env.example          # Przykładowy plik środowiskowy
├── docker-compose.yml    # Konfiguracja Docker Compose
├── package.json          # Zależności npm
└── tsconfig.json         # Konfiguracja TypeScript
```

## Implementacja bazy danych

### Struktura bazy danych (tabele)

1. **users**

   - id (PK)
   - email (unique)
   - password (hashed)
   - firstName
   - lastName
   - role (enum: CUSTOMER, EMPLOYEE, PHARMACIST, ADMIN)
   - createdAt
   - updatedAt

2. **drugs**

   - id (PK)
   - name
   - dose
   - price
   - type
   - companyName
   - amount
   - createdAt
   - updatedAt

3. **orders**

   - id (PK)
   - userId (FK)
   - orderDate
   - status (enum: PENDING, COMPLETED, CANCELLED)
   - createdAt
   - updatedAt

4. **orderItems**
   - id (PK)
   - orderId (FK)
   - drugId (FK)
   - quantity
   - price
   - createdAt
   - updatedAt

## API Endpoints

### Autentykacja

- POST /api/auth/register - Rejestracja nowego użytkownika
- POST /api/auth/login - Logowanie użytkownika
- GET /api/auth/me - Pobranie informacji o zalogowanym użytkowniku
- POST /api/auth/refresh-token - Odświeżenie tokenu JWT

### Leki

- GET /api/drugs - Pobranie listy leków (z paginacją i filtrowaniem)
- GET /api/drugs/:id - Pobranie szczegółów leku
- POST /api/drugs - Dodanie nowego leku (tylko PHARMACIST i ADMIN)
- PUT /api/drugs/:id - Aktualizacja leku (tylko PHARMACIST i ADMIN)
- DELETE /api/drugs/:id - Usunięcie leku (tylko PHARMACIST i ADMIN)

### Zamówienia

- GET /api/orders - Pobranie zamówień użytkownika
- GET /api/orders/:id - Pobranie szczegółów zamówienia
- POST /api/orders - Utworzenie nowego zamówienia
- GET /api/admin/orders - Pobranie wszystkich zamówień (tylko EMPLOYEE, PHARMACIST i ADMIN)

## Bezpieczeństwo

1. **Uwierzytelnianie i autoryzacja**

   - JWT z krótkim czasem ważności (access token)
   - Refresh token z dłuższym czasem ważności
   - Middleware sprawdzający uprawnienia

2. **Walidacja danych**

   - Walidacja wszystkich danych wejściowych za pomocą Joi lub Zod
   - Sanityzacja danych

3. **Ochrona przed atakami**

   - Ochrona przed SQL Injection poprzez ORM Prisma
   - Rate limiting
   - Helmet dla nagłówków HTTP
   - CORS

4. **Hashowanie haseł**
   - Bcrypt z odpowiednim salt rounds

## Fazy wdrożenia

1. **Faza 1: Konfiguracja projektu**

   - Inicjalizacja projektu Node.js + TypeScript
   - Konfiguracja ESLint i Prettier
   - Konfiguracja Prisma i połączenia z bazą danych
   - Implementacja podstawowej struktury aplikacji

2. **Faza 2: Implementacja autentykacji**

   - System rejestracji i logowania
   - JWT i middleware autoryzacji
   - Obsługa ról użytkowników

3. **Faza 3: Implementacja zarządzania lekami**

   - CRUD dla leków
   - Walidacja danych
   - Paginacja i filtrowanie

4. **Faza 4: Implementacja zamówień**

   - System zamówień
   - Integracja z lekami
   - Raportowanie

5. **Faza 5: Testy i dokumentacja**

   - Testy jednostkowe i integracyjne
   - Dokumentacja API (Swagger)
   - Dokumentacja wdrożeniowa

6. **Faza 6: Wdrożenie i konteneryzacja**
   - Konfiguracja Docker
   - Konfiguracja CI/CD
   - Produkcyjne wdrożenie

## Podejście do migracji

1. Implementacja nowego backendu równolegle do istniejącego
2. Testowanie nowego API z istniejącym frontendem
3. Stopniowa migracja funkcjonalności
4. Pełne przejście na nowy backend po zakończeniu testów

## Priorytety implementacji

1. System autentykacji i autoryzacji
2. Zarządzanie lekami (CRUD)
3. System zamówień
4. Raportowanie i statystyki
5. Funkcje administracyjne
