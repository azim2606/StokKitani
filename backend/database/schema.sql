CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sku VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    location VARCHAR(255) NOT NULL DEFAULT 'Main Store',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('stock_in', 'stock_out')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    remarks TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

INSERT INTO users (name, email, password_hash, created_at)
VALUES (
    'Brunei Admin',
    'admin@stokkitani.com',
    'password123',
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO items (name, description, sku, category, quantity, minimum_stock, price, cost_price, location, created_at, updated_at)
VALUES
    ('A4 Paper 80gsm', 'Premium high white multi-functional copy paper.', 'ST-A4-80G', 'Stationery', 45, 15, 6.50, 4.80, 'Main Store', NOW(), NOW()),
    ('Thermal Receipt Roll', 'High sensitivity thermal paper rolls for POS billing.', 'RT-THR-01', 'Retail Supplies', 8, 20, 1.20, 0.60, 'Front Counter', NOW(), NOW()),
    ('USB-C Cable', 'Tough braided fast charging USB-C cable 1.5m.', 'IT-USBC-10', 'IT Accessories', 15, 5, 8.90, 4.50, 'Storage Room A', NOW(), NOW()),
    ('Wireless Mouse', 'Ergonomic 2.4G wireless optical mouse.', 'IT-WM-20', 'IT Accessories', 0, 5, 15.00, 8.00, 'Storage Room A', NOW(), NOW()),
    ('Printer Ink Cartridge', 'High yield black ink cartridge for smart jet printers.', 'PR-INK-C5', 'Printing Supplies', 4, 8, 45.00, 32.00, 'Office Cabinet', NOW(), NOW()),
    ('Notebook A5', 'Ruled notebook with elegant hard cover, 160 pages.', 'ST-NB-A5', 'Stationery', 60, 20, 2.50, 1.20, 'Main Store', NOW(), NOW()),
    ('Ballpoint Pen Box', 'Pack of 50 smooth flow blue ink ballpoint pens.', 'ST-PEN-BX', 'Stationery', 30, 10, 5.00, 3.00, 'Office Cabinet', NOW(), NOW()),
    ('HDMI Cable', 'High speed gold-plated HDMI cord 3.0m.', 'IT-HDMI-15', 'IT Accessories', 12, 4, 12.00, 6.00, 'Storage Room A', NOW(), NOW()),
    ('Laptop Stand', 'Adjustable aluminum laptop riser with vents.', 'IT-LS-99', 'IT Accessories', 5, 3, 35.00, 22.00, 'Storage Room A', NOW(), NOW()),
    ('Barcode Sticker Roll', 'Self-adhesive direct thermal barcode paper roll.', 'RT-BCS-05', 'Retail Supplies', 2, 10, 4.50, 2.00, 'Front Counter', NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '10 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'ST-A4-80G'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '9 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'RT-THR-01'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '8 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'IT-USBC-10'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', 10, 'Initial stock load for shop setup.', NOW() - INTERVAL '7 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'IT-WM-20'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_out', 10, 'Sold out on counter orders.', NOW() - INTERVAL '6 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'IT-WM-20'
AND NOT EXISTS (
    SELECT 1
    FROM stock_movements sm
    WHERE sm.item_id = items.id
      AND sm.type = 'stock_out'
      AND sm.quantity = 10
);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '5 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'PR-INK-C5'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '4 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'ST-NB-A5'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '3 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'ST-PEN-BX'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '2 hours', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'IT-HDMI-15'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW() - INTERVAL '1 hour', (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'IT-LS-99'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);

INSERT INTO stock_movements (item_id, type, quantity, remarks, created_at, created_by)
SELECT id, 'stock_in', quantity, 'Initial stock load for shop setup.', NOW(), (SELECT id FROM users WHERE email = 'admin@stokkitani.com')
FROM items
WHERE sku = 'RT-BCS-05'
AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE item_id = items.id);
