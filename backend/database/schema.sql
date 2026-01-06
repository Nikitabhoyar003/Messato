-- SQLite
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK(role IN ('USER','VENDOR','ADMIN','SUPERADMIN')) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  shop_name TEXT,
  status TEXT CHECK(status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
  address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


-- MENUS TABLE
CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  meal_type TEXT CHECK(meal_type IN ('BREAKFAST','LUNCH','DINNER')),
  description TEXT,
  price REAL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vendor_id INTEGER,
  total_price REAL,
  status TEXT CHECK(status IN ('PLACED','PREPARING','OUT_FOR_DELIVERY','DELIVERED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);



-- SUPER ADMIN
INSERT INTO users (name, email, password, role)
VALUES (
  'Super Admin',
  'superadmin@tiffin.com',
  'superadmin123',
  'SUPERADMIN'
);

 --Admin
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@tiffin.com',
  'admin123',
  'ADMIN'
);


-- NORMAL USER
INSERT INTO users (name, email, password, role)
VALUES (
  'Test User',
  'user@tiffin.com',
  'user123',
  'USER'
);

ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN phoneNumber TEXT;
SELECT * FROM users;
