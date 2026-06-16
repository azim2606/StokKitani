# StokKitani

StokKitani is a bilingual inventory management web app for Brunei SMEs. This submission uses a React frontend, a PHP backend, and PostgreSQL for persistence.

## Stack

- Frontend: React 19 + Vite + Tailwind CSS
- Backend: PHP 8+
- Database: PostgreSQL

## Features

- Login with seeded admin account
- Dashboard summary for inventory health
- Item listing with search, filter, and sort
- Create, update, and delete inventory items
- Stock-in and stock-out actions
- Stock movement audit trail
- English / Bahasa Melayu toggle

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
|   `-- components/
|-- package.json
|-- vite.config.ts
`-- README.md
```

## Prerequisites

Please install these before running the project:

- Node.js 18+ with `npm`
- PHP 8.2+ with `pdo_pgsql` and `pgsql` enabled
- PostgreSQL 16+ or compatible

## Setup

### 1. Clone and install frontend dependencies

From the project root:

```bash
npm install
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
```

### 2. Create the PostgreSQL database

Create a database named `stokkitani`.

Example with `psql`:

```bash
createdb -U postgres stokkitani
```

Or create it manually in pgAdmin.

### 3. Import the schema and seed data

Run:

```bash
psql -U postgres -d stokkitani -f backend/database/schema.sql
```

Or in pgAdmin:

1. Open the `stokkitani` database.
2. Open `Tools` > `Query Tool`.
3. Paste the contents of [backend/database/schema.sql](/d:/vscode/project%201/StokKitani/backend/database/schema.sql).
4. Execute the script.

After import, these tables should exist:

- `users`
- `sessions`
- `items`
- `stock_movements`

### 4. Configure backend environment

Create [backend/.env](/d:/vscode/project%201/StokKitani/backend/.env) with:

```env
APP_ENV=development
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173
DATABASE_URL=pgsql:host=127.0.0.1;port=5432;dbname=stokkitani
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_POSTGRES_PASSWORD
```

Replace `YOUR_POSTGRES_PASSWORD` with your local PostgreSQL password.

## Run Locally

You need two terminals.

### Terminal 1: PHP backend

From the project root:

```bash
php -S 127.0.0.1:8000 -t backend/public backend/public/router.php
```

If `php` is not on your `PATH`, use the full executable path instead.

### Terminal 2: React frontend

From the project root:

```bash
npm run dev
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend base URL: `http://127.0.0.1:8000`

## Demo Login

Use the seeded account:

- Email: `admin@stokkitani.com`
- Password: `password123`

## Quick Verification Checklist

After startup, an interviewer can verify the app with this sequence:

1. Open `http://localhost:5173`
2. Log in with the seeded account
3. Confirm the dashboard loads
4. Open the Items page and verify seeded inventory is visible
5. Create a new item
6. Perform a stock-in or stock-out action
7. Open Stock Movements and confirm a new audit entry appears

To confirm database writes in PostgreSQL:

```sql
SELECT * FROM users;
SELECT * FROM sessions ORDER BY id DESC;
SELECT * FROM items ORDER BY id DESC;
SELECT * FROM stock_movements ORDER BY id DESC;
```

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

## Notes

- The active runtime path is PHP + PostgreSQL. The old Node backend file is not required to run the current app.
- Vite proxies `/api/*` requests to `http://127.0.0.1:8000` during local development.
- If login fails with a connection error, the PHP backend is usually not running.
