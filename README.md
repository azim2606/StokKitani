# StokKitani 📦
### Simple Inventory Management for Brunei SMEs (Dwi-Bahasa: EN / BM)

StokKitani is a bilingual, cloud-ready full-stack inventory management system designed for Brunei small-to-medium enterprises (PKS/SMEs). Built with speed, robustness, and visual fidelity in mind, it simplifies counting catalog stock levels, handles direct inventory increments/decrements (Stock-In & Stock-Out), maintains fully-auditable historical logs, and triggers instant alerts for running low on items.

This project has been developed as a premier interview assessment submission, demonstrating rigorous standard architectures, complete database integrity, dual-language translation overlays, and a premium visual dashboard.

---

## 🚀 Key Features

* **Bilingual Instant Overlay (EN / BM)**: Simple, zero-dependency toggle between English and Bahasa Melayu (Brunei) to welcome regional workers seamlessly.
* **Smart Dashboard Analytics**: Real-time KPI summaries for total items cataloged, low stock items, out-of-stock items, and total cumulative asset valuation in BND (Brunei Dollars).
* **Robust REST API Core**: Complete standard REST endpoints representing professional architecture (Create, Read, Update, Delete).
* **Automatic Audit Logging & Stock-In/Out Tracking**: Seamless logging triggers every time stock flows in or out of the warehouse, capturing item, quantity change, and remarks.
* **Integrity Validation & Checks**: Enforces zero-negative-bounds on price parameters, protects SKU uniqueness constraints, and blocks stock-outs that would cause negative quantities.
* **Modern Brunei Premium UI**: Refined typography, custom warning/info status tags, clean whitespace distribution, soft shadows, and card templates using the brand colors:
  * Brand Dark (`#111827`)
  * Brand Gold (`#C9A227`)
  * Warm Sand App Canvas (`#F8F6F1`)

---

## 🛠️ Stack Architecture

* **Backend Engine**: Node.js / Express (TypeScript) serving as a high-speed HTTP router.
* **Frontend View**: React 19 (Vite) + Lucide Icons + Motion Layout Transitions.
* **Styling Framework**: Tailwind CSS v4 featuring responsive boundaries, smooth grid structures, and professional touch-targets.
* **Security & Auth**: Session-Token handshake with secure PBKDF2/SHA-256 password hashing.
* **Database Persistency**: Robust, transaction-safe JSON storage writing atomically on-disk to `data.json` to guarantee data persistence between starts.

---

## 📂 Project Structure

```text
StokKitani/
├── server.ts              # Express API Server and Persistent JSON-DB orchestration
├── src/
│   ├── main.tsx           # Client entry points
│   ├── App.tsx            # Main parent state manager, routers and API integrations
│   ├── types.ts           # Shared TS Models, mappings & bilingual dictionaries
│   ├── index.css          # Tailwind CSS v4 custom color themes and imports
│   └── components/        # Isolated UI presentation chunks
│       ├── Navbar.tsx             # Global headers & language togglers
│       ├── LoginView.tsx          # Split screen layout containing demo hints
│       ├── DashboardView.tsx      # Stat counters, banners & recent movements logs 
│       ├── ItemsView.tsx          # Dynamic table grid (search, sort, filter)
│       ├── ItemModal.tsx          # Catalog creation & update parameters editor
│       └── StockActionModal.tsx   # Stock-in/out form (qty limits & notes fields)
├── package.json           # Build, dev & production compilation configuration
├── tsconfig.json          # TypeScript compilations setups
└── README.md              # Technical presentation layout (This file)
```

---

## 📋 Logical Database Schema Overview

Although represented in transactional JSON for Cloud Run container portability, StokKitani models the PostgreSQL layout requested in the assessment:

### Table: `users`
* `id` (SERIAL PRIMARY KEY)
* `name` (VARCHAR)
* `email` (VARCHAR, UNIQUE)
* `password_hash` (TEXT)
* `created_at` (TIMESTAMP)

### Table: `items`
* `id` (SERIAL PRIMARY KEY)
* `name` (VARCHAR)
* `description` (TEXT)
* `sku` (VARCHAR, UNIQUE)
* `category` (VARCHAR)
* `quantity` (INTEGER DEFAULT 0) - *Checked to be ≥ 0*
* `minimum_stock` (INTEGER DEFAULT 0) - *Checked to be ≥ 0*
* `price` (NUMERIC DEFAULT 0) - *Checked to be ≥ 0*
* `cost_price` (NUMERIC DEFAULT 0) - *Checked to be ≥ 0*
* `location` (VARCHAR)
* `created_at` (TIMESTAMP)
* `updated_at` (TIMESTAMP)

### Table: `stock_movements`
* `id` (SERIAL PRIMARY KEY)
* `item_id` (INTEGER, REFERENCES items.id)
* `type` (VARCHAR) - *Checked to be either 'stock_in' or 'stock_out'*
* `quantity` (INTEGER) - *Checked to be > 0*
* `remarks` (TEXT)
* `created_at` (TIMESTAMP)

---

## 🗺️ API Endpoint Mappings

### 🔐 Authentication
* `POST /api/login` - Validates credentials. Returns custom Token & Session details.
* `POST /api/logout` - Terminates active session.

### 📊 Dashboard
* `GET /api/dashboard/summary` - Dynamically calculates aggregate metadata and retrieves the 6 most recent movements.

### 📦 Inventory Catalog
* `GET /api/items` - Fetches items. Supports:
  * Searching: `?search=A4` (filters SKU, name, room description, location)
  * Filtering: `?category=Stationery` & `?status=low_stock`
  * Sorting: `?sort=quantity` or `?sort=price` (all in BND)
* `POST /api/items` - Creates item. Enforces unique SKU checks and logs a movement.
* `GET /api/items/:id` - Retrieves detailed specifications of a single item.
* `PUT /api/items/:id` - Modifies parameters (such as minimum thresholds, prices).
* `DELETE /api/items/:id` - Deletes catalog item and wipes its historical movement log to ensure cascading consistency.

### 🔄 Stock audit
* `POST /api/items/:id/stock-in` - Increases item stock level and records action.
* `POST /api/items/:id/stock-out` - Decreases stock level if balance is sufficient, else throws a `400 Bad Request`.
* `GET /api/stock-movements` - Fetches complete descending audit trail.

---

## 🔑 Demo Account Login

For instant evaluation, the database auto-seeds a default admin account on startup:

* **Email**: `admin@stokkitani.com`
* **Password**: `password123`

---

## 🏃 Setup & Run Locally

### Approach 1: Native Node.js Setup
1. Ensure **Node.js v18+** is installed on your local machine.
2. Unpack the files, move into the directory, and install dependencies:
   ```bash
   npm install
   ```
3. Boot the full-stack system in development mode:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Approach 2: Building Production Outputs
1. Compiles the front-end Vite resources and bundles the backend server into optimized production formats inside `dist/`:
   ```bash
   npm run build
   ```
2. Start the output production server:
   ```bash
   npm run start
   ```

---

## 🤝 Interview Presentation Angle

When presenting **StokKitani** to the interview panel, emphasize these architectural and business decisions:

1. **Focus on Local Business Realism**: Built as a dwi-bahasa (English/Bahasa Melayu) system because real retail and storeroom administrative personnel in Brunei benefit extensively from simple terminology switching.
2. **Speed and Efficiency**: Developed with lightweight, high-performance TypeScript and Node.js. It avoids unnecessary framework boilerplate, starting instantly and updating database actions on and off disk atomically with zero overhead.
3. **Robust Safety Constraints**: It isn't just basic CRUD. All inputs are strictly type-validated, prices cannot drop below zero, SKU constraints prevent duplicate record naming conflicts, and stock-outs are locked whenever they exceed available stock. This represents deep understanding of reliable production systems engineering.
4. **Brunei Premium Identity**: Designed with an elegant layout (combining Slate `#111827` and Gold `#C9A227` colors on warm backgrounds) that avoids looking like a standard blue bootstrap template. It makes StokKitani immediately feel customized, specialized, and professionally crafted.
