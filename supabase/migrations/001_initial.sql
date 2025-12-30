-- SPE Exchange Tool - Initial Schema
-- All prices stored as INTEGER cents (3500 = $35.00)

-- PROFILES (auto-created on signup via trigger)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  tier TEXT DEFAULT 'free',
  ebay_store_type TEXT DEFAULT 'basic',
  promoted_percent NUMERIC DEFAULT 0 CHECK (promoted_percent >= 0 AND promoted_percent <= 20),
  target_roi NUMERIC DEFAULT 30,
  default_weight TEXT DEFAULT '8oz',
  default_sell_platform TEXT DEFAULT 'eBay',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEALS (before items for FK reference)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT,
  notes TEXT,
  total_cost INTEGER,
  estimated_value INTEGER,
  estimated_profit INTEGER,
  status TEXT DEFAULT 'active',
  actual_revenue INTEGER,
  actual_profit INTEGER,
  actual_roi NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ITEMS
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT,
  condition TEXT,
  type TEXT DEFAULT 'game',
  weight TEXT DEFAULT '8oz',
  status TEXT DEFAULT 'in_stock',

  loose_price INTEGER,
  cib_price INTEGER,
  new_price INTEGER,
  purchase_cost INTEGER,
  estimated_value INTEGER,

  sale_price INTEGER,
  sale_platform TEXT,
  sale_date DATE,
  sale_fees INTEGER,
  shipping_cost INTEGER,
  actual_profit INTEGER,

  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICE GUIDE
CREATE TABLE price_guide (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  variant TEXT DEFAULT 'Standard',
  loose_price INTEGER,
  cib_price INTEGER,
  new_price INTEGER,
  pricecharting_id TEXT,
  last_updated TIMESTAMPTZ,
  source TEXT DEFAULT 'pricecharting',
  search_name TEXT,
  UNIQUE(name, platform, variant)
);

CREATE INDEX idx_price_guide_search ON price_guide(search_name);
CREATE INDEX idx_price_guide_platform ON price_guide(platform);

-- SCANS
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  items_found INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_guide ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_user_access" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "items_user_access" ON items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "deals_user_access" ON deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "scans_user_access" ON scans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "price_guide_authenticated_read" ON price_guide FOR SELECT TO authenticated USING (true);
CREATE POLICY "price_guide_service_write" ON price_guide FOR ALL TO service_role USING (true);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- AUTO-UPDATE updated_at ON ITEMS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_items_updated
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- INDEXES
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_deal_id ON items(deal_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_scans_user_id ON scans(user_id);
