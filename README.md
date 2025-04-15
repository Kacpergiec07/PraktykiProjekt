# Poradnik Instalacji Projektu Apteka

Ten poradnik pomoże Ci skonfigurować i uruchomić projekt Apteka, który składa się z backendu API i frontendu Vue.js.

## Wymagania wstępne

Przed rozpoczęciem musisz zainstalować kilka programów:

### 1. Instalacja Node.js

Jeśli nie masz zainstalowanego Node.js:

1. Wejdź na stronę [https://nodejs.org/](https://nodejs.org/)
2. Pobierz i zainstaluj wersję LTS (Long Term Support)
3. Postępuj zgodnie z instrukcjami kreatora instalacji
4. Sprawdź instalację otwierając Wiersz poleceń (cmd) i wpisując:
   ```
   node --version
   ```

### 2. Instalacja Git (Opcjonalnie)

Jeśli chcesz sklonować repozytorium zamiast pobierać je bezpośrednio:

1. Wejdź na stronę [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Pobierz i zainstaluj wersję dla Twojego systemu operacyjnego
3. Postępuj zgodnie z instrukcjami kreatora instalacji

## Ustawienie zasad wykonywania PowerShell

Jeśli używasz PowerShell i napotkasz błędy uprawnień, możliwe, że będziesz musiał zmienić zasady wykonywania:

1. Otwórz PowerShell jako Administrator (kliknij prawym przyciskiem myszy i wybierz "Uruchom jako administrator")
2. Uruchom następujące polecenie:
   ```
   Set-ExecutionPolicy Unrestricted
   ```
3. Wpisz "T" (lub "Y"), gdy zostaniesz poproszony o potwierdzenie

## Pobieranie projektu

### Opcja 1: Pobierz plik ZIP
1. Pobierz projekt jako plik ZIP
2. Rozpakuj go do folderu na swoim komputerze

### Opcja 2: Klonowanie za pomocą Git
1. Otwórz Wiersz poleceń lub PowerShell
2. Przejdź do miejsca, w którym chcesz przechowywać projekt
3. Uruchom:
   ```
   git clone [adres URL repozytorium]
   ```

## Instalacja zależności

1. Otwórz Wiersz poleceń lub PowerShell
2. Przejdź do głównego folderu projektu
3. Uruchom:
   ```
   npm install
   ```
   To zainstaluje pakiet concurrently potrzebny do uruchomienia zarówno frontendu, jak i backendu

4. Zainstaluj zależności backendu:
   ```
   cd backend
   npm install
   cd ..
   ```

5. Zainstaluj zależności frontendu:
   ```
   cd frontEnd
   npm install
   cd ..
   ```

## Uruchamianie projektu

### Uruchamianie wszystkiego naraz

Z głównego folderu projektu uruchom:
```
npm start
```

To uruchomi jednocześnie backend i frontend.

### Uruchamianie tylko backendu

Z głównego folderu projektu uruchom:
```
npm run start:backend
```

### Uruchamianie tylko frontendu

Z głównego folderu projektu uruchom:
```
npm run start:frontend
```

## Dostęp do aplikacji

- Frontend: Otwórz przeglądarkę i wejdź na `http://localhost:5173` (lub port pokazany w terminalu)
- Backend API: Dostępne na `http://localhost:3000` (lub port skonfigurowany w backendzie)

## Rozwiązywanie problemów

### Błąd "nie znaleziono node.exe"
- Upewnij się, że Node.js jest prawidłowo zainstalowany
- Jeśli używasz Windows, możliwe, że będziesz musiał poprawić ścieżkę w package.json:
  - Otwórz backend/package.json
  - Zmień `"dev": ".\node.exe index.js"` na `"dev": "node index.js"`

### Błędy uprawnień
- Jeśli napotkasz błędy uprawnień w PowerShell, uruchom:
  ```
  Set-ExecutionPolicy Unrestricted
  ```
  w PowerShell uruchomionym jako Administrator

### Błąd "nie znaleziono polecenia npm"
- Upewnij się, że Node.js jest prawidłowo zainstalowany
- Spróbuj zrestartować komputer po zainstalowaniu Node.js

### Port jest już w użyciu
- Jeśli którykolwiek port jest już w użyciu, możesz zmodyfikować ustawienia portu:
  - Dla backendu: Sprawdź kod backendu w celu konfiguracji portu
  - Dla frontendu: Otwórz frontEnd/vite.config.js i zmień port