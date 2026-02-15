# Supabase Setup Guide for Netlify Deployment

This guide helps you set up Supabase tables needed for serverless deployment on Netlify.

## Prerequisites

1. Supabase account (free tier available at supabase.com)
2. Your project already has these credentials in `.env`:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`

## Setup Instructions

### 1. Go to Supabase Dashboard
- Navigate to https://supabase.com and log in
- Select your project
- Go to "SQL Editor" in the sidebar

### 2. Create Tables

Run the following SQL statements in order:

```sql
-- Divers table
CREATE TABLE IF NOT EXISTS divers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  certification_level TEXT,
  medical_cleared BOOLEAN DEFAULT true,
  waiver_signed BOOLEAN DEFAULT false,
  waiver_signed_date TIMESTAMP,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  duration_days INTEGER,
  description TEXT,
  instructor_id UUID,
  boat_id UUID,
  start_date TEXT,
  end_date TEXT,
  max_students INTEGER DEFAULT 6,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'fundive',
  leader_id UUID,
  course_id UUID,
  days INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accommodations table
CREATE TABLE IF NOT EXISTS accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_per_night DECIMAL(10,2),
  tier TEXT DEFAULT 'standard',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID NOT NULL REFERENCES divers(id),
  course_id UUID REFERENCES courses(id),
  group_id UUID REFERENCES groups(id),
  accommodation_id UUID REFERENCES accommodations(id),
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  total_amount DECIMAL(10,2),
  invoice_number TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2),
  can_buy BOOLEAN DEFAULT true,
  can_rent BOOLEAN DEFAULT true,
  rent_price_per_day DECIMAL(10,2),
  quantity_in_stock INTEGER DEFAULT 0,
  quantity_available_for_rent INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  supplier TEXT,
  description TEXT,
  barcode TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Enable Row Level Security (Optional but Recommended)

For production, enable RLS to secure your data:

```sql
ALTER TABLE divers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
```

Create a policy to allow public access (or adjust as needed):

```sql
CREATE POLICY "Allow public read" ON divers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON accommodations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON equipment FOR SELECT USING (true);
```

### 4. Set Netlify Environment Variables

In Netlify:
1. Go to your site settings → Build & deploy → Environment
2. Add these environment variables (use values from your `.env`):
   - `VITE_SUPABASE_URL` 
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

That's it! Your Netlify deployment will now use Supabase as the database backend.

## Local Development

For local development, you still have two options:

1. **Use Express + SQLite** (current setup):
   ```bash
   npm run dev  # Frontend at 8000
   npm --prefix server start  # Backend at 3000
   ```

2. **Use Netlify Functions + Supabase locally**:
   ```bash
   npm run dev  # Frontend at 8000
   # API calls will hit /.netlify/functions/api via netlify dev
   ```

## Switching Between Environments

The API client automatically detects the environment:
- **Localhost**: Uses `http://localhost:3000` (Express + SQLite)
- **Netlify**: Uses `/.netlify/functions/api` (Netlify Functions + Supabase)
