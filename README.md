# Personal manager - Kompleksowe Zarządzanie codziennymi zadaniami

Personal manager to pełnoprawna aplikacja fullstack służąca do zarządzania zadaniami indywidualnymi oraz grupowymi. Umożliwia tworzenie współdzielonych dashboardów, które składają się z mini-aplikacji i narzędzi takich jak listy zadań (ToDo), notatki, listy zakupów i wiele więcej.

## Funkcjonalności

- **Tworzenie i zarządzanie dashboardami** – organizuj swoje zadania i narzędzia w spersonalizowanych panelach.
- **Współdzielenie dashboardów** – zapraszaj innych użytkowników do współpracy.
- **Notyfikacje** – powiadomienia dla zaproszonych użytkowników o dołączeniu do grup.
- **Logi aktywności** – śledź historię działań w dashboardach.
- **Zaawansowane listy ToDo** – twórz, edytuj i zarządzaj zadaniami z opcjami filtrowania i sortowania.
- **Notatki** – dodawaj i organizuj swoje notatki w prosty sposób.
- **Listy zakupów** – zarządzaj produktami i listami zakupów z funkcją edycji.
- **Filtrowanie i sortowanie** – dostosuj widoki mini-aplikacji do swoich potrzeb.
- **Posty i komentarze** – pełna obsługa CRUD (tworzenie, odczyt, aktualizacja, usuwanie) dla postów i komentarzy.

## Technologie

Personal manager został zbudowany z wykorzystaniem nowoczesnego stacku technologicznego:

- **MERN**:
  - **MongoDB** – baza danych NoSQL do przechowywania danych.
  - **Express.js** – framework backendowy Node.js.
  - **React** – biblioteka frontendowa do tworzenia interfejsu użytkownika.
  - **Node.js** – środowisko uruchomieniowe backendu.
- **TypeScript** – zapewnia typowanie statyczne i lepszą organizację kodu.

## Instalacja

1. Skolnuj repozytorium

```bash
git clone https://github.com/wojciech94/personal-manager.git
```

2. Przejdź do katalogu projektu

```bash
cd personal-manager
```

3. Zainstaluj zależności

```bash
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

lub

```bash
npm install; cd backend; npm install; cd ../frontend; npm install; cd ..
```

4. Skonfiguruj połączenie z mongoDB
   - Zainstaluj MongoDB lokalnie lub użyj chmury (MongoDB Atlas)
   - Opcja 1: Lokalna baza danych z MongoDB Compass
     - Pobierz i zainstaluj MongoDB Compass `https://www.mongodb.com/products/tools/compass`
     - Uruchom MongoDB Compass - automatycznie uruchomi lokalny server na domyślnym adresie mongodb://localhost:27017
     - W Compass utwórz nową bazę danych o nazwie personal-manager (opcjonalnie)
   - Opcja 2: Lokalny MongoDB Community Server
     - Pobierz i zainstaluj MongoDB Community Server `https://www.mongodb.com/try/download/community`
     - Uruchom serwer MongoDB
     ```bash
       mongod
     ```
   - Opcja 3: MongoDB Atlas
     - Zarejestruj się na MongoDB Atlas `https://www.mongodb.com/cloud/atlas`
     - Utwórz Utwórz klaster i skopiuj connection string (np. mongodb+srv://<username>:<password>@cluster0.mongodb.net/personal-manager?retryWrites=true&w=majority), zastępując <username> i <password> swoimi danymi.
5. Skonfiguruj zmienne środowiskowe:

   - W folderze `backend` stwórz plik `.env` na podstawie `backend/.env.example`.
   - Przykład:
     ```
     PORT=5000
     DB_URL=mongodb://localhost:27017/personal-manager  # Dla lokalnego MongoDB (Compass lub Community Server)
     ```

# lub np. mongodb+srv://user:pass@cluster0.mongodb.net/personal-manager?retryWrites=true&w=majority dla Atlas

     JWT_SECRET=your_random_64_char_string
     JWT_REFRESH_SECRET=another_random_64_char_string
     ```

- **Generowanie `JWT_SECRET` i `JWT_REFRESH_SECRET`:**
  - Przejdź do folderu backend

```bash
  cd backend
```

- Uruchom node w trybie interaktywnym

```bash
 node
```

- Wygeneruj klucz

```bash
 require('crypto').randomBytes(32).toString('hex');
```

- Skopiuj 2 wygenerowane ciągi do zmiennych środowiskowych JWT_SECRET i JWT_REFRESH_SECRET w pliku .env
- Zakończ sesję node klikając `CTRL + C`

- W folderze `frontend` opcjonalnie możesz stworzyć plik `.env.production` z kluczem `VITE_API_URL` gdy umieścisz api na serwerze (np. Render)

## Uruchamianie aplikacji

- W folderze głównym projektu uruchom:

```bash
  npm start
```

- Zarejestruj konto za pomocą loginu i hasła lub zaloguj do konta testowego.
- Ciesz się aplikacją tworząc współdzielone dashboardy i uzywając mini aplikacji pomagających w planowaniu i zarządzaniu czasem.
