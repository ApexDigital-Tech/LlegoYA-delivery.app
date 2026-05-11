-- LlegoYA Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, -- Format LY-XXXX
  client_name TEXT,
  client_phone TEXT,
  vendor_id UUID REFERENCES vendors(id),
  vendor_name TEXT,
  total DECIMAL NOT NULL,
  items TEXT[], -- Array of item strings
  status TEXT DEFAULT 'pendiente',
  stage INTEGER DEFAULT 1,
  courier_id TEXT,
  courier_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for all tables (Postgres 13+ way)
-- Note: You might need to do this via the Supabase UI (Database -> Replication)
-- but these SQL commands are for reference.
-- ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
-- ALTER PUBLICATION supabase_realtime ADD TABLE products;
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
