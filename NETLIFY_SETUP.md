# Netlify Serverless Deployment Setup

You now have a **hybrid setup** for local and serverless deployment:

## What's Changed

### ✅ Created:
1. **Netlify Functions** (`netlify/functions/api.ts`)
   - Handles API requests in Supabase environment
   - Supports key endpoints: divers, bookings, courses, groups, accommodations, equipment
   - Automatically routes from `/.netlify/functions/api`

2. **Updated netlify.toml**
   - Routes `/api/*` requests to Netlify Functions
   - Publishes the `dist` folder (built frontend)
   - Enables serverless functions

3. **Updated API Client** (`src/integrations/api/client.ts`)
   - Auto-detects environment (local vs Netlify)
   - Uses `localhost:3000` for local development (Express + SQLite)
   - Uses relative paths for Netlify production (Netlify Functions + Supabase)

4. **Setup Guides**
   - `SUPABASE_SETUP.md` - Step-by-step Supabase table creation

## Environment Setup

### Local Development (Still Works)
```bash
# Terminal 1: Frontend
npm run dev  # Port 8000

# Terminal 2: Backend
npm --prefix server start  # Port 3000
```

The frontend automatically connects to `localhost:3000` for API calls.

### Netlify Production (New)
1. **Set up Supabase tables** (follow `SUPABASE_SETUP.md`)
2. **Deploy to Netlify**:
   - Connect your GitHub repo to Netlify
   - Netlify will build and deploy automatically
   - Netlify Functions will handle API calls using Supabase

3. **Environment Variables on Netlify**:
   - Go to Site Settings → Build & deploy → Environment
   - Add:
     - `VITE_SUPABASE_URL` (from your `.env`)
     - `VITE_SUPABASE_PUBLISHABLE_KEY` (from your `.env`)

## How It Works

### Local (Express + SQLite)
```
Frontend (Port 8000) → API Client → localhost:3000 → Express → SQLite
```

### Netlify (Netlify Functions + Supabase)
```
Frontend (Netlify) → API Client → /.netlify/functions/api → Supabase
```

The API client automatically chooses the right endpoint!

## Next Steps

1. **Create Supabase tables** (follow the SQL in `SUPABASE_SETUP.md`)
2. **Test locally** with Express + SQLite (current setup)
3. **Deploy to Netlify**:
   - The repo should now deploy without needing an external backend URL
   - API calls will use Netlify Functions + Supabase

## Missing Endpoints

The Netlify Function currently supports:
- ✅ Divers (list, get, create, update)
- ✅ Bookings (list, create, update)
- ✅ Courses (list, create)
- ✅ Groups (list)
- ✅ Accommodations (list)
- ✅ Equipment (list)

Not yet implemented (still need Express server locally):
- ❌ Transactions, Payments, POS
- ❌ Rental Assignments
- ❌ Waivers, Incidents (these use Supabase, not the API)
- ❌ Complex operations (updates, deletes for some entities)

For features not in Netlify Functions, you'll need to:
1. Expand the Netlify Function to cover more endpoints, OR
2. Deploy an Express server (Railway, Render, Heroku, etc.)

## troubleshooting

**Q: API returns 404 on Netlify**
A: The endpoint might not be implemented in the Netlify Function. Check `netlify/functions/api.ts` and expand it with the missing endpoint.

**Q: Works locally but not on Netlify**
A: Make sure Supabase tables exist and environment variables are set in Netlify.

**Q: Data not persisting on Netlify**
A: Netlify Functions need to use a persistent database (Supabase). Ensure tables are created and populated in Supabase.
