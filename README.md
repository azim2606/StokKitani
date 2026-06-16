# StokKitani

Inventory management app for Brunei SMEs with a React frontend and a PHP/PostgreSQL backend.

## Current Architecture

- Frontend: React 19 + Vite + Tailwind CSS
- Backend: PHP 8+ REST API


## Project Structure

```text
StokKitani/
|-- backend/
|   |-- public/
|   |   |-- index.php
|   |   `-- router.php
|   |-- src/
|   |   |-- Api.php
|   |   |-- Database.php
|   |   |-- HttpException.php
|   |   |-- Request.php
|   |   |-- Response.php
|   |   `-- bootstrap.php
|   `-- database/
|       `-- schema.sql
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- types.ts
|   `-- components/
|-- package.json
`-- vite.config.ts
```

## Database Tables

- `users`
- `sessions`
- `items`
- `stock_movements`

The schema and seed data live in [backend/database/schema.sql](/d:/vscode/project%201/StokKitani/backend/database/schema.sql).

## Default Login

- Email: `admin@stokkitani.com`
- Password: `password123`

## Local Setup

### 1. Frontend dependencies

Install Node.js dependencies:

```bash
npm install
```

### 2. PostgreSQL database

Create a database, for example `stokkitani`, then load the schema:

```bash
psql -U postgres -d stokkitani -f backend/database/schema.sql
```

### 3. Backend configuration

Copy `backend/.env.example` to `backend/.env` and update:

- `DATABASE_URL`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `FRONTEND_URL` if your frontend runs on a different origin

Example DSN:

```env
DATABASE_URL=pgsql:host=127.0.0.1;port=5432;dbname=stokkitani
```

### 4. Run the PHP API

Require PHP 8+ with `pdo_pgsql` enabled:

```bash
php -S 127.0.0.1:8000 -t backend/public backend/public/router.php
```

### 5. Run the frontend

Start Vite:

```bash
npm run dev
```

Open `http://localhost:5173`.

During development, Vite proxies `/api/*` to `http://127.0.0.1:8000` by default. Override that with `VITE_API_URL` if needed.

## API Endpoints

- `POST /api/login`
- `POST /api/logout`
- `GET /api/dashboard/summary`
- `GET /api/items`
- `POST /api/items`
- `GET /api/items/:id`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`
- `POST /api/items/bulk-delete`
- `POST /api/items/:id/stock-in`
- `POST /api/items/:id/stock-out`
- `GET /api/stock-movements`



