-- LlegoYA Supabase Schema Optimized for Custom IDs
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- 1. Vendors Table
CREATE TABLE vendors (
  id TEXT PRIMARY KEY, 
  name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rating DECIMAL DEFAULT 0,
  delivery_time TEXT DEFAULT '20-30 min',
  is_verified BOOLEAN DEFAULT false,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- Format LY-XXXX
  client_name TEXT,
  client_phone TEXT,
  vendor_id TEXT REFERENCES vendors(id),
  vendor_name TEXT,
  total DECIMAL NOT NULL,
  items TEXT[], 
  status TEXT DEFAULT 'pendiente',
  stage INTEGER DEFAULT 1,
  courier_id TEXT,
  courier_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS pero con políticas abiertas para el MVP
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Realtime
alter publication supabase_realtime add table vendors;
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;
