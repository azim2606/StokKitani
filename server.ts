import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import pg from "pg";
import { createServer as createViteServer } from "vite";
import { Item, StockMovement, User } from "./src/types";

// Setup database persistence file
const DATA_FILE = path.join(process.cwd(), "data.json");

// Simple crypto-based password hasher
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Initializing the default database when it doesn't exist
function getInitialData() {
  const adminPasswordHash = hashPassword("password123");
  const defaultUser: User = {
    id: 1,
    name: "Brunei Admin",
    email: "admin@stokkitani.com",
    createdAt: new Date().toISOString()
  };

  const defaultItems: Item[] = [
    {
      id: 1,
      name: "A4 Paper 80gsm",
      description: "Premium high white multi-functional copy paper.",
      sku: "ST-A4-80G",
      category: "Stationery",
      quantity: 45,
      minimumStock: 15,
      price: 6.50,
      costPrice: 4.80,
      location: "Main Store",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Thermal Receipt Roll",
      description: "High sensitivity thermal paper rolls for POS billing.",
      sku: "RT-THR-01",
      category: "Retail Supplies",
      quantity: 8,
      minimumStock: 20,
      price: 1.20,
      costPrice: 0.60,
      location: "Front Counter",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "USB-C Cable",
      description: "Tough braided fast charging USB-C cable 1.5m.",
      sku: "IT-USBC-10",
      category: "IT Accessories",
      quantity: 15,
      minimumStock: 5,
      price: 8.90,
      costPrice: 4.50,
      location: "Storage Room A",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      name: "Wireless Mouse",
      description: "Ergonomic 2.4G wireless optical mouse.",
      sku: "IT-WM-20",
      category: "IT Accessories",
      quantity: 0,
      minimumStock: 5,
      price: 15.00,
      costPrice: 8.00,
      location: "Storage Room A",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      name: "Printer Ink Cartridge",
      description: "High yield black ink cartridge for smart jet printers.",
      sku: "PR-INK-C5",
      category: "Printing Supplies",
      quantity: 4,
      minimumStock: 8,
      price: 45.00,
      costPrice: 32.00,
      location: "Office Cabinet",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 6,
      name: "Notebook A5",
      description: "Ruled notebook with elegant hard cover, 160 pages.",
      sku: "ST-NB-A5",
      category: "Stationery",
      quantity: 60,
      minimumStock: 20,
      price: 2.50,
      costPrice: 1.20,
      location: "Main Store",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 7,
      name: "Ballpoint Pen Box",
      description: "Pack of 50 smooth flow blue ink ballpoint pens.",
      sku: "ST-PEN-BX",
      category: "Stationery",
      quantity: 30,
      minimumStock: 10,
      price: 5.00,
      costPrice: 3.00,
      location: "Office Cabinet",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 8,
      name: "HDMI Cable",
      description: "High speed gold-plated HDMI cord 3.0m.",
      sku: "IT-HDMI-15",
      category: "IT Accessories",
      quantity: 12,
      minimumStock: 4,
      price: 12.00,
      costPrice: 6.00,
      location: "Storage Room A",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 9,
      name: "Laptop Stand",
      description: "Adjustable aluminum laptop riser with vents.",
      sku: "IT-LS-99",
      category: "IT Accessories",
      quantity: 5,
      minimumStock: 3,
      price: 35.00,
      costPrice: 22.00,
      location: "Storage Room A",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 10,
      name: "Barcode Sticker Roll",
      description: "Self-adhesive direct thermal barcode paper roll.",
      sku: "RT-BCS-05",
      category: "Retail Supplies",
      quantity: 2,
      minimumStock: 10,
      price: 4.50,
      costPrice: 2.00,
      location: "Front Counter",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Populate some initial stock movement records
  const defaultMovements: StockMovement[] = defaultItems.map((item, idx) => ({
    id: idx + 1,
    itemId: item.id,
    type: "stock_in",
    quantity: item.quantity > 0 ? item.quantity : 10,
    remarks: "Initial stock load for shop setup.",
    createdAt: new Date(Date.now() - (10 - idx) * 3600000).toISOString()
  }));

  // Wireless Mouse initial history of stock out to reach 0
  defaultMovements.push({
    id: 11,
    itemId: 4,
    type: "stock_out",
    quantity: 10,
    remarks: "Sold out on counter orders.",
    createdAt: new Date().toISOString()
  });

  return {
    users: [{ ...defaultUser, passwordHash: adminPasswordHash }],
    items: defaultItems,
    movements: defaultMovements,
  };
}

// Global DB State Manager with PostgreSQL support and cache synchronization
class Database {
  private data: {
    users: Array<User & { passwordHash: string }>;
    items: Item[];
    movements: StockMovement[];
  };
  private pool: pg.Pool | null = null;
  private isPostgres = false;

  constructor() {
    this.data = getInitialData();
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.log("[StokKitani Database] DATABASE_URL detected. Activating PostgreSQL support.");
      this.pool = new pg.Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
      });
      this.isPostgres = true;
    } else {
      console.log("[StokKitani Database] No DATABASE_URL detected. Activating local JSON filesystem fallback.");
      this.loadLocal();
    }
  }

  loadLocal() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } else {
        this.saveLocal();
      }
    } catch (e) {
      console.error("Database reading failed, using safe memory state:", e);
    }
  }

  saveLocal() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Database writing failed:", e);
    }
  }

  async initPostgres() {
    if (!this.pool) return;
    try {
      console.log("[StokKitani Database] Connecting to PostgreSQL database...");
      
      // 1. Create tables if they do not exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at VARCHAR(100) NOT NULL
        );
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sku VARCHAR(100) UNIQUE NOT NULL,
          category VARCHAR(100) NOT NULL,
          quantity INT NOT NULL,
          minimum_stock INT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          cost_price DECIMAL(10,2) NOT NULL,
          location VARCHAR(255) NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          updated_at VARCHAR(100) NOT NULL
        );
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS stock_movements (
          id SERIAL PRIMARY KEY,
          item_id INT NOT NULL,
          type VARCHAR(20) NOT NULL,
          quantity INT NOT NULL,
          remarks TEXT,
          created_at VARCHAR(100) NOT NULL
        );
      `);

      // 2. Check if users are empty. If empty, seed data.
      const userCountRes = await this.pool.query("SELECT COUNT(*) FROM users;");
      const userCount = parseInt(userCountRes.rows[0].count);

      if (userCount === 0) {
        console.log("[StokKitani Database] PostgreSQL tables are empty. Seeding defaults...");
        const defaultData = getInitialData();
        
        // Seed users
        for (const u of defaultData.users) {
          await this.pool.query(
            "INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING;",
            [u.id, u.name, u.email, u.passwordHash, u.createdAt]
          );
        }

        // Seed items
        for (const item of defaultData.items) {
          await this.pool.query(
            "INSERT INTO items (id, name, description, sku, category, quantity, minimum_stock, price, cost_price, location, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (sku) DO NOTHING;",
            [item.id, item.name, item.description, item.sku, item.category, item.quantity, item.minimumStock, item.price, item.costPrice, item.location, item.createdAt, item.updatedAt]
          );
        }

        // Seed movements
        for (const mov of defaultData.movements) {
          await this.pool.query(
            "INSERT INTO stock_movements (id, item_id, type, quantity, remarks, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING;",
            [mov.id, mov.itemId, mov.type, mov.quantity, mov.remarks, mov.createdAt]
          );
        }

        // Reset serial sequences to avoid conflicts
        await this.pool.query("SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM users;");
        await this.pool.query("SELECT setval(pg_get_serial_sequence('items', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM items;");
        await this.pool.query("SELECT setval(pg_get_serial_sequence('stock_movements', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM stock_movements;");
      }

      // 3. Load all from Postgres to memory cache
      console.log("[StokKitani Database] Loading data from PostgreSQL into memory cache...");
      const usersRes = await this.pool.query("SELECT * FROM users ORDER BY id ASC;");
      const itemsRes = await this.pool.query("SELECT * FROM items ORDER BY id ASC;");
      const movementsRes = await this.pool.query("SELECT * FROM stock_movements ORDER BY id ASC;");

      const pgUsers = usersRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        passwordHash: r.password_hash,
        createdAt: r.created_at
      }));

      const pgItems = itemsRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        sku: r.sku,
        category: r.category,
        quantity: parseInt(r.quantity),
        minimumStock: parseInt(r.minimum_stock),
        price: parseFloat(r.price),
        costPrice: parseFloat(r.cost_price),
        location: r.location,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      const pgMovements = movementsRes.rows.map((r) => ({
        id: r.id,
        itemId: parseInt(r.item_id),
        type: r.type as "stock_in" | "stock_out",
        quantity: parseInt(r.quantity),
        remarks: r.remarks || "",
        createdAt: r.created_at
      }));

      this.data = {
        users: pgUsers,
        items: pgItems,
        movements: pgMovements
      };
      
      console.log(`[StokKitani Database] Successfully cached ${this.data.items.length} items and ${this.data.movements.length} movements from PostgreSQL.`);
    } catch (err) {
      console.error("[StokKitani Database] Failed to initialize PostgreSQL. Falling back to local JSON file.", err);
      this.isPostgres = false;
      this.loadLocal();
    }
  }

  getUsers() { return this.data.users; }
  getItems() { return this.data.items; }
  getMovements() { return this.data.movements; }

  // Async background synchronizer
  private syncPostgresWrite(fn: () => Promise<void>) {
    if (!this.isPostgres || !this.pool) {
      this.saveLocal();
      return;
    }
    fn().catch((err) => {
      console.error("[StokKitani Database] Sync update write to PostgreSQL failed:", err);
    });
  }

  saveItem(item: Item) {
    const idx = this.data.items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      this.data.items[idx] = item;
    } else {
      this.data.items.push(item);
    }

    this.syncPostgresWrite(async () => {
      await this.pool!.query(
        `INSERT INTO items (id, name, description, sku, category, quantity, minimum_stock, price, cost_price, location, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           sku = EXCLUDED.sku,
           category = EXCLUDED.category,
           quantity = EXCLUDED.quantity,
           minimum_stock = EXCLUDED.minimum_stock,
           price = EXCLUDED.price,
           cost_price = EXCLUDED.cost_price,
           location = EXCLUDED.location,
           updated_at = EXCLUDED.updated_at;`,
        [item.id, item.name, item.description, item.sku, item.category, item.quantity, item.minimumStock, item.price, item.costPrice, item.location, item.createdAt, item.updatedAt]
      );
      await this.pool!.query("SELECT setval(pg_get_serial_sequence('items', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM items;");
    });
  }

  deleteItem(id: number) {
    this.data.items = this.data.items.filter((i) => i.id !== id);
    this.data.movements = this.data.movements.filter((m) => m.itemId !== id);

    this.syncPostgresWrite(async () => {
      await this.pool!.query("DELETE FROM stock_movements WHERE item_id = $1;", [id]);
      await this.pool!.query("DELETE FROM items WHERE id = $1;", [id]);
    });
  }

  deleteItems(ids: number[]) {
    this.data.items = this.data.items.filter((i) => !ids.includes(i.id));
    this.data.movements = this.data.movements.filter((m) => !ids.includes(m.itemId));

    this.syncPostgresWrite(async () => {
      await this.pool!.query("DELETE FROM stock_movements WHERE item_id = ANY($1);", [ids]);
      await this.pool!.query("DELETE FROM items WHERE id = ANY($1);", [ids]);
    });
  }

  saveMovement(movement: StockMovement) {
    const idx = this.data.movements.findIndex((m) => m.id === movement.id);
    if (idx >= 0) {
      this.data.movements[idx] = movement;
    } else {
      this.data.movements.push(movement);
    }

    this.syncPostgresWrite(async () => {
      await this.pool!.query(
        "INSERT INTO stock_movements (id, item_id, type, quantity, remarks, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING;",
        [movement.id, movement.itemId, movement.type, movement.quantity, movement.remarks, movement.createdAt]
      );
      await this.pool!.query("SELECT setval(pg_get_serial_sequence('stock_movements', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM stock_movements;");
    });
  }
}

const dbInstance = new Database();

async function startServer() {
  // Initialize and migrate Postgres if configured
  await dbInstance.initPostgres();

  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // API Token Validation middleware
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access denied: Missing auth token" });
      return;
    }

    // High performance auth validation for demonstration purposes, validating session match
    if (token === "STOKKITANI_DEMO_ADMIN_SESSION_TOKEN") {
      next();
    } else {
      res.status(403).json({ error: "Access denied: Invalid or expired token" });
    }
  };

  // REST API: Authentication Endpoints
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = dbInstance.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "Invalid email or password / Emel atau kata laluan tidak sah" });
      return;
    }

    res.json({
      token: "STOKKITANI_DEMO_ADMIN_SESSION_TOKEN",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });

  app.post("/api/logout", (req, res) => {
    res.json({ success: true, message: "Successfully logged out" });
  });

  // REST API: Dashboard summary cards
  app.get("/api/dashboard/summary", authenticateToken, (req, res) => {
    const items = dbInstance.getItems();
    const movements = dbInstance.getMovements();

    let totalItems = items.length;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let totalValue = 0;

    items.forEach((item) => {
      totalValue += item.quantity * item.price;
      if (item.quantity === 0) {
        outOfStockItems++;
      } else if (item.quantity <= item.minimumStock) {
        lowStockItems++;
      }
    });

    // Decorate recent movements with item names for simple frontend presentation
    const recentMovements = movements
      .slice(-6)
      .reverse()
      .map((mov) => {
        const item = items.find((i) => i.id === mov.itemId);
        return {
          ...mov,
          itemName: item ? item.name : "Deleted Item",
        };
      });

    res.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      recentMovements,
    });
  });

  // REST API: Retrieve all inventory items (with Search, Sorting, Categories, Status filter)
  app.get("/api/items", authenticateToken, (req, res) => {
    let items = [...dbInstance.getItems()];
    const search = req.query.search ? String(req.query.search).toLowerCase() : "";
    const sort = req.query.sort ? String(req.query.sort) : "";
    const category = req.query.category ? String(req.query.category) : "";
    const status = req.query.status ? String(req.query.status) : "";

    // 1. Search Query Filters (Name, SKU, Description, Storage Location)
    if (search) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.sku.toLowerCase().includes(search) ||
          (i.description && i.description.toLowerCase().includes(search)) ||
          i.location.toLowerCase().includes(search) ||
          i.category.toLowerCase().includes(search)
      );
    }

    // 2. Category Filters
    if (category && category !== "all") {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    // 3. Status Filters (low_stock, out_of_stock, in_stock)
    if (status && status !== "all") {
      items = items.filter((i) => {
        if (status === "out_of_stock") {
          return i.quantity === 0;
        } else if (status === "low_stock") {
          return i.quantity > 0 && i.quantity <= i.minimumStock;
        } else if (status === "in_stock") {
          return i.quantity > i.minimumStock;
        }
        return true;
      });
    }

    // 4. Sort Strategy (Name, Quantity, Price)
    if (sort) {
      if (sort === "name") {
        items.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === "quantity") {
        items.sort((a, b) => a.quantity - b.quantity);
      } else if (sort === "price") {
        items.sort((a, b) => a.price - b.price);
      } else if (sort === "sku") {
        items.sort((a, b) => a.sku.localeCompare(b.sku));
      }
    } else {
      // Default: sort by id descending
      items.sort((a, b) => b.id - a.id);
    }

    res.json(items);
  });

  // REST API: Retrieve one item by ID
  app.get("/api/items/:id", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const item = dbInstance.getItems().find((i) => i.id === id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    res.json(item);
  });

  // REST API: Create inventory item
  app.post("/api/items", authenticateToken, (req, res) => {
    const { name, description, sku, category, quantity, minimumStock, price, costPrice, location } = req.body;

    // Proper Validation
    if (!name || !sku || !category || quantity === undefined || price === undefined || minimumStock === undefined) {
      res.status(400).json({ error: "Missing required fields (name, sku, category, quantity, minimumStock, price)" });
      return;
    }

    // Uniqueness Constraints Check
    const existingSku = dbInstance.getItems().find((i) => i.sku.toUpperCase() === sku.toUpperCase());
    if (existingSku) {
      res.status(400).json({ error: "SKU code already exists in inventory / Kod SKU sudah wujud" });
      return;
    }

    // Values boundaries check
    if (quantity < 0 || minimumStock < 0 || price < 0 || (costPrice !== undefined && costPrice < 0)) {
      res.status(400).json({ error: "Quantities, stock limits, and prices cannot be negative values" });
      return;
    }

    const items = dbInstance.getItems();
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

    const newItem: Item = {
      id: newId,
      name,
      description: description || "",
      sku: sku.toUpperCase(),
      category,
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
      price: Number(price),
      costPrice: costPrice !== undefined ? Number(costPrice) : 0,
      location: location || "Main Store",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbInstance.saveItem(newItem);

    // Automatically record first loading inventory movement
    const movements = dbInstance.getMovements();
    const mId = movements.length > 0 ? Math.max(...movements.map((m) => m.id)) + 1 : 1;
    const initialMovement: StockMovement = {
      id: mId,
      itemId: newItem.id,
      type: "stock_in",
      quantity: newItem.quantity,
      remarks: "Initial inventory setup.",
      createdAt: new Date().toISOString()
    };
    dbInstance.saveMovement(initialMovement);

    res.status(201).json(newItem);
  });

  // REST API: Update inventory item
  app.put("/api/items/:id", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const item = dbInstance.getItems().find((i) => i.id === id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const { name, description, sku, category, minimumStock, price, costPrice, location } = req.body;

    // Validation
    if (!name || !sku || !category || price === undefined || minimumStock === undefined) {
      res.status(400).json({ error: "Missing required fields for update" });
      return;
    }

    // SKU clash checks (other than self)
    const existingSku = dbInstance.getItems().find((i) => i.sku.toUpperCase() === sku.toUpperCase() && i.id !== id);
    if (existingSku) {
      res.status(400).json({ error: "SKU code already exists on another item / Kod SKU sudah wujud" });
      return;
    }

    // Boundaries check
    if (minimumStock < 0 || price < 0 || (costPrice !== undefined && costPrice < 0)) {
      res.status(400).json({ error: "Lower bound constraint violated: Pricing and quantities cannot be negative" });
      return;
    }

    const updatedItem: Item = {
      ...item,
      name,
      description: description || "",
      sku: sku.toUpperCase(),
      category,
      minimumStock: Number(minimumStock),
      price: Number(price),
      costPrice: costPrice !== undefined ? Number(costPrice) : 0,
      location: location || "Main Store",
      updatedAt: new Date().toISOString()
    };

    dbInstance.saveItem(updatedItem);
    res.json(updatedItem);
  });

  // REST API: Delete inventory item
  app.delete("/api/items/:id", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const itemIdx = dbInstance.getItems().findIndex((i) => i.id === id);

    if (itemIdx === -1) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    dbInstance.deleteItem(id);
    res.json({ success: true, message: "Item successfully deleted along with historical logs" });
  });

  // REST API: Bulk delete inventory items
  app.post("/api/items/bulk-delete", authenticateToken, (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "Invalid parameters: Provide non-empty ids array" });
      return;
    }

    const numericIds = ids.map((id) => Number(id)).filter((id) => !isNaN(id));
    dbInstance.deleteItems(numericIds);
    res.json({
      success: true,
      message: `Successfully deleted ${numericIds.length} items from inventory catalog.`
    });
  });

  // REST API: Stock In (Add quantity with automated audit logging)
  app.post("/api/items/:id/stock-in", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const item = dbInstance.getItems().find((i) => i.id === id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const { quantity, remarks } = req.body;
    const qtyNum = Number(quantity);

    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      res.status(400).json({ error: "Valid stock-in quantity (greater than 0) is required" });
      return;
    }

    // Increase item quantity
    item.quantity += qtyNum;
    item.updatedAt = new Date().toISOString();
    dbInstance.saveItem(item);

    // Save stock-in movement
    const movements = dbInstance.getMovements();
    const mId = movements.length > 0 ? Math.max(...movements.map((m) => m.id)) + 1 : 1;
    const newMovement: StockMovement = {
      id: mId,
      itemId: item.id,
      type: "stock_in",
      quantity: qtyNum,
      remarks: remarks || "Received cargo shipment.",
      createdAt: new Date().toISOString()
    };
    dbInstance.saveMovement(newMovement);

    res.json({ success: true, item, movement: newMovement });
  });

  // REST API: Stock Out (Reduce quantity with automated audit logging)
  app.post("/api/items/:id/stock-out", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const item = dbInstance.getItems().find((i) => i.id === id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const { quantity, remarks } = req.body;
    const qtyNum = Number(quantity);

    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      res.status(400).json({ error: "Valid stock-out quantity (greater than 0) is required" });
      return;
    }

    // Check boundary
    if (item.quantity < qtyNum) {
      res.status(400).json({ error: "Insufficient stock count / Baki stok tidak mencukupi" });
      return;
    }

    // Reduce item quantity
    item.quantity -= qtyNum;
    item.updatedAt = new Date().toISOString();
    dbInstance.saveItem(item);

    // Save stock-out movement
    const movements = dbInstance.getMovements();
    const mId = movements.length > 0 ? Math.max(...movements.map((m) => m.id)) + 1 : 1;
    const newMovement: StockMovement = {
      id: mId,
      itemId: item.id,
      type: "stock_out",
      quantity: qtyNum,
      remarks: remarks || "Dispatched delivery / order.",
      createdAt: new Date().toISOString()
    };
    dbInstance.saveMovement(newMovement);

    res.json({ success: true, item, movement: newMovement });
  });

  // REST API: Get full stock movements log
  app.get("/api/stock-movements", authenticateToken, (req, res) => {
    const movements = [...dbInstance.getMovements()];
    const items = dbInstance.getItems();

    // Stagger movement with item details nicely
    const decoratedMovements = movements.reverse().map((mov) => {
      const item = items.find((i) => i.id === mov.itemId);
      return {
        ...mov,
        itemName: item ? item.name : "Deleted Item",
        itemSku: item ? item.sku : "N/A"
      };
    });

    res.json(decoratedMovements);
  });

  // Start Vite dev server or serve production dist
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[StokKitani App] Listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start backend server:", err);
});
